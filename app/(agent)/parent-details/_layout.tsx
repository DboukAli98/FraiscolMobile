import { Stack } from 'expo-router';

export default function ParentDetailsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
