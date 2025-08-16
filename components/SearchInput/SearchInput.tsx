// components/SearchInput/SearchInput.tsx
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { scaleFont, verticalScale } from '@/utils/stylings';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TextInput,
    View,
    ViewStyle
} from 'react-native';

export interface SearchInputProps {
    // Search props
    searchQuery?: string;
    onSearch?: (query: string) => void;
    placeholder?: string;
    isSearching?: boolean;

    // Styling
    style?: ViewStyle;
    showBorder?: boolean;

    // Behavior
    debounceMs?: number;
    autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    searchQuery = '',
    onSearch,
    placeholder = 'Search...',
    isSearching = false,
    style,
    showBorder = true,
    debounceMs = 500,
    autoFocus = false,
}) => {
    const [searchText, setSearchText] = useState(searchQuery);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<TextInput>(null);

    // Sync search text with external searchQuery prop
    useEffect(() => {
        setSearchText(searchQuery);
    }, [searchQuery]);

    // Handle search with immediate UI update and debounced API call
    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text); // Update UI immediately for responsive feel

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for API call
        searchTimeoutRef.current = setTimeout(() => {
            onSearch?.(text);
        }, debounceMs);
    }, [onSearch, debounceMs]);

    // Clean up search timeout
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Auto focus if requested
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <View style={[
            styles.container,
            showBorder && styles.containerWithBorder,
            style
        ]}>
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.searchInput,
                        isSearching && styles.searchInputSearching
                    ]}
                    value={searchText}
                    onChangeText={handleSearchChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.disabled}
                    // Prevent keyboard dismissal
                    blurOnSubmit={false}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="default"
                    // Additional props to keep keyboard stable
                    clearButtonMode="while-editing"
                    enablesReturnKeyAutomatically={false}
                />
                {isSearching && (
                    <View style={styles.loadingIndicator}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary.main}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

// Memoized version to prevent unnecessary re-renders
export const MemoizedSearchInput = React.memo(SearchInput);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacingX._20,
        paddingVertical: spacingY._10,
        backgroundColor: colors.background.default,
    },
    containerWithBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#e1e5e9',
    },
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        height: verticalScale(40),
        borderWidth: 1,
        borderColor: colors.border?.main || '#d1d5db',
        borderRadius: radius._10,
        paddingHorizontal: spacingX._15,
        paddingRight: spacingX._40, // Make room for loading indicator
        fontSize: scaleFont(16),
        color: colors.text.primary,
        backgroundColor: colors.background.paper,
    },
    searchInputSearching: {
        borderColor: colors.primary.light,
    },
    loadingIndicator: {
        position: 'absolute',
        right: spacingX._12,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});