# Multi-stage build for smaller production image
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /tmp/
RUN pip install --upgrade pip && \
    pip install --user --no-warn-script-location -r /tmp/requirements.txt

# Production stage
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/root/.local/bin:$PATH \
    DJANGO_SETTINGS_MODULE=home_wallet.settings.prod

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security (don't run as root)
RUN groupadd -r gennycraft && useradd -r -g gennycraft gennycraft

# Set work directory
WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy project files
COPY --chown=gennycraft:gennycraft . .

# Create necessary directories
RUN mkdir -p media staticfiles logs && \
    chown -R gennycraft:gennycraft /app

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Switch to non-root user
USER gennycraft

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ready/ || exit 1

# Expose port
EXPOSE 8000

# Use gunicorn with auto-calculated workers and better configuration
# Workers = (2 × CPU) + 1, threads for I/O-bound operations
CMD ["gunicorn", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--threads", "2", \
     "--worker-class", "gthread", \
     "--worker-tmp-dir", "/dev/shm", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "100", \
     "--timeout", "60", \
     "--graceful-timeout", "30", \
     "--keep-alive", "5", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "info", \
     "home_wallet.wsgi:application"]
