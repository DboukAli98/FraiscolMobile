// components/ListItems/MerchandiseItem.tsx
import { Card } from '@/components/Card/CardComponent';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { SchoolMerchandise } from '@/services/merchandisesServices';
import { scale, scaleFont } from '@/utils/stylings';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export interface MerchandiseItemProps {
    merchandise: SchoolMerchandise;
    onPress?: (merchandise: SchoolMerchandise) => void;
    onAddToCart?: (merchandise: SchoolMerchandise) => void;
    showActions?: boolean;
    style?: ViewStyle;
}

export const MerchandiseItem: React.FC<MerchandiseItemProps> = ({
    merchandise,
    onPress,
    onAddToCart,
    showActions = true,
    style,
}) => {
    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CFA',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    // Get image URL - you'll need to adjust this based on your image server
    const getImageUrl = (logoPath: string, schoolId: number) => {
        if (!logoPath) return null;
        // Adjust this URL to match your backend image server
        return `https://schoolfeesapi.azurewebsites.net/uploads/merchandises/${schoolId}/${logoPath}`;
    };

    const handlePress = () => {
        onPress?.(merchandise);
    };

    const handleAddToCart = () => {
        onAddToCart?.(merchandise);
    };

    return (
        <Card
            style={style ? { ...styles.container, ...style } : styles.container}
            onPress={onPress ? handlePress : undefined}
            shadow="sm"
            padding="_15"
        >
            <View style={styles.content}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    {merchandise.schoolMerchandiseLogo && getImageUrl(merchandise.schoolMerchandiseLogo, merchandise.fK_SchoolId) ? (
                        <Image
                            source={{ uri: getImageUrl(merchandise.schoolMerchandiseLogo, merchandise.fK_SchoolId) as string }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons
                                name="bag-outline"
                                size={scale(24)}
                                color={colors.text.disabled}
                            />
                        </View>
                    )}
                </View>

                {/* Content Section */}
                <View style={styles.textContent}>
                    {/* Title and Price Row */}
                    <View style={styles.titleRow}>
                        <Text style={styles.name} numberOfLines={2}>
                            {merchandise.schoolMerchandiseName}
                        </Text>
                        <Text style={styles.price}>
                            {formatPrice(merchandise.schoolMerchandisePrice)}
                        </Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.description} numberOfLines={3}>
                        {merchandise.schoolMerchandiseDescription}
                    </Text>

                    {/* Category and Date Info */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons
                                name="pricetag-outline"
                                size={scale(12)}
                                color={colors.text.secondary}
                            />
                            <Text style={styles.infoText}>
                                Cat. {merchandise.fK_SchoolMerchandiseCategory}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons
                                name="calendar-outline"
                                size={scale(12)}
                                color={colors.text.secondary}
                            />
                            <Text style={styles.infoText}>
                                {formatDate(merchandise.createdOn)}
                            </Text>
                        </View>
                    </View>

                    {/* Action Button */}
                    {showActions && onAddToCart && (
                        <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={handleAddToCart}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="cart-outline"
                                size={scale(16)}
                                color={colors.text.white}
                            />
                            <Text style={styles.addToCartText}>Ajouter au panier</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Card>
    );
};


export const CompactMerchandiseItem: React.FC<MerchandiseItemProps> = ({
    merchandise,
    onPress,
    onAddToCart,
    style,
}) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CFA',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getImageUrl = (logoPath: string, schoolId: number) => {
        if (!logoPath) return null;
        return `https://schoolfeesapi.azurewebsites.net/uploads/merchandises/${schoolId}/${logoPath}`;
    };

    return (
        <TouchableOpacity
            style={[styles.compactContainer, style]}
            onPress={() => onPress?.(merchandise)}
            activeOpacity={0.7}
        >
            {/* Image */}
            <View style={styles.compactImageContainer}>
                {merchandise.schoolMerchandiseLogo && getImageUrl(merchandise.schoolMerchandiseLogo, merchandise.fK_SchoolId) ? (
                    <Image
                        source={{ uri: getImageUrl(merchandise.schoolMerchandiseLogo, merchandise.fK_SchoolId) as string }}
                        style={styles.compactImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.compactPlaceholder}>
                        <Ionicons
                            name="bag-outline"
                            size={scale(20)}
                            color={colors.text.disabled}
                        />
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.compactContent}>
                <Text style={styles.compactName} numberOfLines={2}>
                    {merchandise.schoolMerchandiseName}
                </Text>
                <Text style={styles.compactPrice}>
                    {formatPrice(merchandise.schoolMerchandisePrice)}
                </Text>

                {/* Add to Cart Button */}
                {onAddToCart && (
                    <TouchableOpacity
                        style={styles.compactAddButton}
                        onPress={() => onAddToCart(merchandise)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="add"
                            size={scale(16)}
                            color={colors.text.white}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Regular item styles
    container: {
        marginBottom: spacingY._10,
    },
    content: {
        flexDirection: 'row',
    },
    imageContainer: {
        width: scale(80),
        height: scale(80),
        marginRight: spacingX._15,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: radius._10,
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        borderRadius: radius._10,
        backgroundColor: colors.background.paper,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacingY._7,
    },
    name: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.text.primary,
        flex: 1,
        marginRight: spacingX._10,
    },
    price: {
        fontSize: scaleFont(16),
        fontWeight: 'bold',
        color: colors.primary.main,
    },
    description: {
        fontSize: scaleFont(13),
        color: colors.text.secondary,
        lineHeight: scaleFont(18),
        marginBottom: spacingY._10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacingY._12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: scaleFont(11),
        color: colors.text.secondary,
        marginLeft: spacingX._5,
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary.main,
        paddingHorizontal: spacingX._15,
        paddingVertical: spacingY._7,
        borderRadius: radius._10,
    },
    addToCartText: {
        fontSize: scaleFont(13),
        fontWeight: '600',
        color: colors.text.white,
        marginLeft: spacingX._7,
    },

    // Compact item styles
    compactContainer: {
        backgroundColor: colors.background.default,
        borderRadius: radius._12,
        padding: spacingX._12,
        marginBottom: spacingY._10,
        borderWidth: 1,
        borderColor: colors.border?.light || '#e1e5e9',
        width: '48%', // For 2-column grid
    },
    compactImageContainer: {
        width: '100%',
        height: scale(100),
        marginBottom: spacingY._10,
        position: 'relative',
    },
    compactImage: {
        width: '100%',
        height: '100%',
        borderRadius: radius._10,
    },
    compactPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: radius._10,
        backgroundColor: colors.background.paper,
        justifyContent: 'center',
        alignItems: 'center',
    },
    compactContent: {
        flex: 1,
    },
    compactName: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacingY._5,
        lineHeight: scaleFont(18),
    },
    compactPrice: {
        fontSize: scaleFont(14),
        fontWeight: 'bold',
        color: colors.primary.main,
        marginBottom: spacingY._10,
    },
    compactAddButton: {
        backgroundColor: colors.primary.main,
        borderRadius: radius._10,
        padding: spacingX._7,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: scale(10),
        right: scale(10),
        width: scale(30),
        height: scale(30),
    },
});