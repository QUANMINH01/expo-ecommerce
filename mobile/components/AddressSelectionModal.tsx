import { useAddresses } from "@/hooks/useAddresses";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (address: Address) => void;
  isProcessing: boolean;
}

const AddressSelectionModal = ({
  visible,
  onClose,
  onProceed,
  isProcessing,
}: AddressSelectionModalProps) => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { addresses, isLoading: addressesLoading } = useAddresses();

  useEffect(() => {
    if (!visible) return;

    if (addresses?.length && !selectedAddress) {
      const defaultAddress =
        addresses.find((address: Address) => address.isDefault) || addresses[0];

      setSelectedAddress(defaultAddress);
    }
  }, [visible, addresses, selectedAddress]);

  const handleContinue = () => {
    console.log("Continue to Payment pressed");
    console.log("Selected address:", selectedAddress);
    console.log("Is processing:", isProcessing);

    if (isProcessing) return;

    if (!selectedAddress) {
      Alert.alert("Select Address", "Please select a shipping address first.");
      return;
    }

    onProceed(selectedAddress);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl max-h-[85%]">
          <View className="flex-row items-center justify-between p-6 border-b border-surface">
            <Text className="text-text-primary text-2xl font-bold">
              Select Address
            </Text>

            <TouchableOpacity
              onPress={onClose}
              className="bg-surface rounded-full p-2"
              disabled={isProcessing}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="p-6"
            style={{ maxHeight: 420 }}
            showsVerticalScrollIndicator={false}
          >
            {addressesLoading ? (
              <View className="py-8">
                <ActivityIndicator size="large" color="#00D9FF" />
              </View>
            ) : (
              <View className="gap-4">
                {addresses?.map((address: Address) => (
                  <TouchableOpacity
                    key={address._id}
                    className={`bg-surface rounded-3xl p-6 border-2 ${
                      selectedAddress?._id === address._id
                        ? "border-primary"
                        : "border-background-lighter"
                    }`}
                    activeOpacity={0.7}
                    onPress={() => {
                      console.log("Address selected:", address._id);
                      setSelectedAddress(address);
                    }}
                    disabled={isProcessing}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-3">
                          <Text className="text-primary font-bold text-lg mr-2">
                            {address.label}
                          </Text>

                          {address.isDefault && (
                            <View className="bg-primary/20 rounded-full px-3 py-1">
                              <Text className="text-primary text-sm font-semibold">
                                Default
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-text-primary font-semibold text-lg mb-2">
                          {address.fullName}
                        </Text>

                        <Text className="text-text-secondary text-base leading-6 mb-1">
                          {address.streetAddress}
                        </Text>

                        <Text className="text-text-secondary text-base mb-2">
                          {address.city}, {address.state} {address.zipCode}
                        </Text>

                        <Text className="text-text-secondary text-base">
                          {address.phoneNumber}
                        </Text>
                      </View>

                      {selectedAddress?._id === address._id && (
                        <View className="bg-primary rounded-full p-2 ml-3">
                          <Ionicons
                            name="checkmark"
                            size={24}
                            color="#121212"
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <View className="p-6 border-t border-surface">
            <TouchableOpacity
              className={`rounded-2xl py-5 ${
                isProcessing ? "bg-gray-500" : "bg-primary"
              }`}
              activeOpacity={0.9}
              onPress={handleContinue}
            >
              <View className="flex-row items-center justify-center">
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#121212" />
                ) : (
                  <>
                    <Text className="text-background font-bold text-lg mr-2">
                      Continue to Payment
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#121212" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddressSelectionModal;
