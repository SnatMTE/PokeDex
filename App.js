// Created by Snat
// This is a simple React Native app that allows users to select a Pokémon region and view Pokémon details.
// It uses the PokeAPI to fetch Pokémon data based on the selected region.

import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

// Define the regions and their corresponding Pokémon ID ranges
const REGIONS = {
  "Kanto": [1, 151],
  "Johto": [152, 251],
  "Hoenn": [252, 386],
  "Sinnoh": [387, 493],
  "Unova": [494, 649],
  "Kalos": [650, 721],
  "Alola": [722, 809],
  "Galar": [810, 898],
  "Paldea": [899, 1010],
};

// Component to select a region
function RegionSelector({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Select a Region</Text>
      {Object.keys(REGIONS).map(region => (
        <Button
          key={region}
          title={region}
          onPress={() => navigation.navigate('PokemonList', { region })}
        />
      ))}
    </View>
  );
}

// Component to display the list of Pokémon in the selected region
function PokemonList({ route, navigation }) {
  const { region } = route.params;
  const [pokemonList, setPokemonList] = useState([]);

  // Fetch Pokémon data based on the selected region
  // This will fetch Pokémon from the specified ID range for the selected region

  useEffect(() => {
    const [start, end] = REGIONS[region];
    const fetchPokemon = async () => {
      const promises = [];
      for (let i = start; i <= end; i++) {
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
      }
      const results = await Promise.all(promises);
      setPokemonList(results);
    };
    fetchPokemon();
  }, [region]);

  // Render the list of Pokémon using FlatList
  // Each item will be a TouchableOpacity that navigates to the Pokémon details page
  return (
    <FlatList
      data={pokemonList}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('PokemonDetails', { pokemon: item })}>
          <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
            <Image source={{ uri: item.sprites.front_default }} style={{ width: 50, height: 50 }} />
            <Text style={{ marginLeft: 10 }}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

// Component to display the details of a selected Pokémon
// This component will show the Pokémon's name, sprite, height, weight, types

function PokemonDetails({ route, navigation }) {
  const { pokemon } = route.params;
  const [evolutionData, setEvolutionData] = useState(null);

  useEffect(() => {
    const fetchEvolution = async () => {
      const speciesRes = await fetch(pokemon.species.url);
      const speciesData = await speciesRes.json();
      const evoRes = await fetch(speciesData.evolution_chain.url);
      const evoData = await evoRes.json();
      setEvolutionData(evoData);
    };
    fetchEvolution();
  }, [pokemon]);

  const renderEvolutionChain = (chain, list = []) => {
    if (!chain) return list;
    list.push(chain.species.name);
    if (chain.evolves_to.length > 0) {
      return renderEvolutionChain(chain.evolves_to[0], list);
    }
    return list;
  };

  const evoChain = evolutionData ? renderEvolutionChain(evolutionData.chain) : [];

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>{pokemon.name}</Text>
      <Image source={{ uri: pokemon.sprites.front_default }} style={{ width: 100, height: 100 }} />
      <Text>Height: {pokemon.height}</Text>
      <Text>Weight: {pokemon.weight}</Text>
      <Text>Types: {pokemon.types.map(t => t.type.name).join(', ')}</Text>

      <Text style={{ marginTop: 20, fontSize: 18 }}>Evolution Chain:</Text>
      {evoChain.map(name => (
        <TouchableOpacity
          key={name}
          onPress={async () => {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const newPokemon = await res.json();
            navigation.push('PokemonDetails', { pokemon: newPokemon });
          }}
        >
          <Text style={{ padding: 5, color: 'blue' }}>{name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// Main App component with navigation setup
// This component sets up the navigation stack and renders the initial screen

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RegionSelector">
        <Stack.Screen name="RegionSelector" component={RegionSelector} />
        <Stack.Screen name="PokemonList" component={PokemonList} />
        <Stack.Screen name="PokemonDetails" component={PokemonDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
