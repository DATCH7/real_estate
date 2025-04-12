import { Redirect } from 'expo-router';

export default function PublishTab() {
    // This tab simply redirects to the property publishing screen
    return <Redirect href="/publish-property" />;
} 