from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    is_global = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id', 'name', 'type', 'color', 'icon',
            'is_active', 'is_global', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'is_global', 'created_at', 'updated_at')

    def get_is_global(self, obj):
        return obj.is_global()

    def validate(self, attrs):
        # Ensure user cannot modify global categories
        if self.instance and self.instance.is_global():
            raise serializers.ValidationError('Cannot modify global categories.')
        return attrs

    def create(self, validated_data):
        # Set the owner to the current user
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
