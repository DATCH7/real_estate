import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import styles from "app/styles/HomeScreenStyle.js"; // Import styles

const HomeScreen = () => {
    const [searchText, setSearchText] = useState("");

    return (
        <ImageBackground source={require("../../../assets/fonts/background.jpg")} style={styles.background}>
            <View style={styles.overlay}>
                <Text style={styles.title}>Trouvez Votre Maison de Rêve</Text>
                <Text style={styles.subtitle}>Votre propriété parfaite est à seulement une recherche de distance.</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Search by location, price, etc."
                    placeholderTextColor="#666"
                    value={searchText}
                    onChangeText={setSearchText}
                />

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default HomeScreen;
