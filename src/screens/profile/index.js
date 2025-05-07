import React from 'react';
import { Button, Alert } from 'react-native';
import { supabase } from '../../lib/supabase'; // Pastikan Anda sudah mengatur supabaseClient

export default function Profile() {
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Signed Out', 'You have been signed out successfully.');
        }
    };

    return (
        <Button title="Sign Out" onPress={handleSignOut} />
    );
}