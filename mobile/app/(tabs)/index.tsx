import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";

import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";

const CATEGORIES = [
  { name: "All", icon: "grid-outline" as const },
  { name: "Electronics", image: require("@/assets/images/electronics.png") },
  { name: "Fashion", image: require("@/assets/images/fashion.png") },
  { name: "Sports", image: require("@/assets/images/sports.png") },
  { name: "Books", image: require("@/assets/images/books.png") },
];

const ShopScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: products = [], isLoading, isError } = useProducts();

  const filteredProducts = useMemo(() => {
    let filtered = Array.isArray(products) ? products : [];

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-4 pt-6">
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">
                Shop
              </Text>
              <Text className="text-text-secondary mt-1 text-sm">
                Browse all products
              </Text>
            </View>

            <TouchableOpacity
              className="bg-surface/50 rounded-full p-3"
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={22} color={"#fff"} />
            </TouchableOpacity>
          </View>

          <View className="bg-surface flex-row items-center rounded-2xl px-5 py-4">
            <Ionicons color={"#666"} size={22} name="search" />
            <TextInput
              placeholder="Search for products"
              placeholderTextColor={"#666"}
              className="text-text-primary ml-3 flex-1 text-base"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  className={`mr-3 size-20 items-center justify-center overflow-hidden rounded-2xl ${isSelected ? "bg-primary" : "bg-surface"}`}
                >
                  {category.icon ? (
                    <Ionicons
                      name={category.icon}
                      size={36}
                      color={isSelected ? "#121212" : "#fff"}
                    />
                  ) : (
                    <Image
                      source={category.image}
                      className="size-12"
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="mb-6 px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-text-primary text-lg font-bold">
              Products
            </Text>
            <Text className="text-text-secondary text-sm">
              {filteredProducts.length} items
            </Text>
          </View>

          <ProductsGrid
            products={filteredProducts}
            isLoading={isLoading}
            isError={isError}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopScreen;
