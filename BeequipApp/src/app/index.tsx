/*
npm install @react-navigation/native
npm install @react-navigation/drawer
npm install @react-navigation/stack
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-screens react-native-safe-area-context
npm install @react-native-community/masked-view
npm install expo-secure-store
npm install @emailjs/browser
npm install expo-linking
npm install expo-web-browser
*/
import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,Image,ScrollView,Modal,TextInput,Alert,Dimensions,Clipboard,ImageBackground,Platform} from 'react-native';
import { NavigationContainer, useFocusEffect, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

import {Item, NewEquipment, UsedEquipment, ProcessEquipment, RentalEquipment} from './inventory';

/*
  Base URL of the Beequip API server (see server/src/index.js).

  The host is taken from the Metro bundler address Expo is already using
  (Constants.expoConfig.hostUri, e.g. "192.168.1.68:8081"), so the app finds
  the server on any device without hardcoding an IP that DHCP may change:
    - iPhone / Android phone: the LAN IP of this computer. A physical phone
      must NEVER use localhost — on the phone that points at the phone itself.
    - Simulators: the LAN IP works there too.
  Exceptions still apply if the network isolates clients (see below).
*/
const getApiBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return `http://${hostUri.split(':')[0]}:3000`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();


/* Header which has the drawer tab button and pressable logo to return to home screen (needs more styling) */

function UniversalHeader({navigation}: any) {
  return (
    <SafeAreaView style={{ backgroundColor: 'rgba(8, 8, 129, 1)' }}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity style={styles.headerToggle} onPress={() => navigation.toggleDrawer()}>
          <Text style={styles.headerMenuIcon}>☰</Text>
        </TouchableOpacity>

        {/*Clicking the logo in the header will take the user back to the home screen*/}
        {/* Will be replaced with a company logo later */}

        <TouchableOpacity style={styles.headerLogo} onPress={() => navigation.navigate('Home')}>
            <Image source={require('../../assets/images/IconOnly_Transparent_NoBuffer (1).png')} style={styles.headerLogoImage} />
          </TouchableOpacity>

        <TouchableOpacity style={styles.headerHistory} onPress={() => navigation.navigate('Purchase History')}>
          <Text style={styles.headerMenuIcon}>📃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


/* Homescreen that will have images and text with brief overview of the app */

function HomeScreen() {
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  const currentIndexRef = useRef(0);
  const { width } = Dimensions.get('window');

  /* Image carousel images */
  const images = [
    require('../../assets/images/SitePicture.jpg'),
    require('../../assets/images/ElectricCoolers.jpg'),
    require('../../assets/images/trailercooler.jpg'),
  ];

  /* image carousel effect that changes image every 3 seconds*/
  useEffect(() => {
    const interval = setInterval(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % images.length;
      scrollViewRef.current?.scrollTo({ x: currentIndexRef.current * width, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, width]);

  /* 
    Under the image carousel there is a text box that has some basic information on the app and company.
    Under that there are two buttons, one to go to the shop page, and one for the contact page.
  */
   return (
    <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.homeContent}>
        <Image source={require('../../assets/images/FullLogo_Transparent_NoBuffer (4).png')} style={styles.homeLogoImage} />
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
          >
            {images.map((imageUri, index) => (
              <Image
                key={index}
                source={imageUri}
                style={{ width, height: 250 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
         <Text style={styles.descriptionText}>
            Welcome to Beequip Products! We are a small oil and gas company with the goal of making your product purchasing and customization less of a hassle. Click on the buttons below to shop or get into contact with our team. Thank you for choosing Beequip!
          </Text>
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Shop')}>
                <Text style={styles.buttonText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Contact Us')}>
                <Text style={styles.buttonText}>Contact Us</Text>
              </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

/* 
  Parent page for the main function of the app. 
  Has categories that when clicked will show a specific type of products.
  Categories will have a picture and a button on the bottom but the entire box is pressable
  There is a search bar that when an input is searched, it will pop up the items from the item list that have that word that was searched in the title or description.
*/

function MainShopScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState('');
  const allItems = [...NewEquipment, ...UsedEquipment, ...ProcessEquipment, ...RentalEquipment];
  const filteredItems = allItems.filter(item => item.title.toLowerCase().includes(searchText.toLowerCase()) || item.description.toLowerCase().includes(searchText.toLowerCase()));

   return (
     <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
       <View style={[styles.searchContainer, {paddingTop: 20}]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for items."
          placeholderTextColor="rgba(27, 27, 184, 1)"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>
       {searchText ? (
         <ScrollView style={{paddingTop: 20}}>
           <ItemList navigation={navigation} items={filteredItems} />
         </ScrollView>
       ) :
       (
         <ScrollView contentContainerStyle={styles.shopWrapper} style={{paddingTop: 20}}>
        <TouchableOpacity style={styles.inventoryCategoryView} onPress={() => navigation.navigate('New Equipment')}>
          <View style={styles.shopContentCard}>
            <View style={styles.imageView}>
              <Image
                style={styles.image}
                source={require('../../assets/images/120 Cooler 2.png')}
                resizeMode="cover"
              />
            </View>
            <View style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>New Equipment</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.inventoryCategoryView} onPress={() => navigation.navigate('Used Equipment')}>
          <View style={styles.shopContentCard}>
            <View style={styles.imageView}>
              <Image
                style={styles.image}
                source={require('../../assets/images/ElectricCoolers.jpg')}
                resizeMode="cover"
              />
            </View>
            <View style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>Used Equipment</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.inventoryCategoryView} onPress={() => navigation.navigate('Process Equipment')}>
          <View style={styles.shopContentCard}>
            <View style={styles.imageView}>
              <Image
                style={styles.image}
                source={require('../../assets/images/120 Cooler 1.png')}
                resizeMode="cover"
              />
            </View>
            <View style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>Process Equipment</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.inventoryCategoryView} onPress={() => navigation.navigate('Rental Equipment')}>
          <View style={styles.shopContentCard}>
            <View style={styles.imageView}>
              <Image
                style={styles.image}
                source={require('../../assets/images/trailercooler.jpg')}
                resizeMode="cover"
              />
            </View>
            <View style={styles.categoryButton}>
              <Text style={styles.categoryButtonText}>Rental Equipment</Text>
            </View>
          </View>
        </TouchableOpacity>
        </ScrollView>
      )}
    </ImageBackground>
  );
}

/* Stack with the different categories of items that will be for sale. This will have more detail and possibly more categories later
   Once clickeed it will take the user to a scrollview with the individual products in the ItemList function*/

const stack = createStackNavigator();
function ShopStack() {
  return (
    <stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: true
      }}
    >
      <stack.Screen
        name="Shop"
        component={MainShopScreen}
      />
      <stack.Screen   
        name="New Equipment" 
        component={Category1} 
      />
      <stack.Screen 
        name="Used Equipment" 
        component={Category2} 
      />
      <stack.Screen 
        name="Process Equipment"  
        component={Category3} 
      />
      <stack.Screen 
        name="Rental Equipment" 
        component={Category4} 
      />
      <stack.Screen
        name="Item Details"
        component={ItemDetailsScreen}
        options={{ title: 'Item Details' }}
      />
    </stack.Navigator>
  );
}

/* each category page takes items from the inventory file and displays them in a scrollview */
 function Category1({ navigation }: any) {
   return (
     <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
       <ScrollView style={{paddingTop: 80}}>
         <ItemList navigation={navigation} items={NewEquipment} />
       </ScrollView>
     </ImageBackground>
   );
 }

 function Category2({ navigation }: any) {
   return (
     <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
       <ScrollView style={{paddingTop: 80}}>
         <ItemList navigation={navigation} items={UsedEquipment} />
       </ScrollView>
     </ImageBackground>
   );
 }

 function Category3({ navigation }: any) {
   return (
     <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
       <ScrollView style={{paddingTop: 80}}>
         <ItemList navigation={navigation} items={ProcessEquipment} />
       </ScrollView>
     </ImageBackground>
   );
 }

 function Category4({ navigation }: any) {
   return (
     <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
       <ScrollView style={{paddingTop: 80}}>
         <ItemList navigation={navigation} items={RentalEquipment} />
       </ScrollView>
     </ImageBackground>
   );
 }

/* item display that is used for every item produced in the in the inventory tab
Can be clicked to display item details*/

function ItemList({ navigation, items}: {navigation: any; items: Item[]}) {
  return (
    <View style={styles.itemListContainer}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.itemCard}
          onPress={() => navigation.navigate('Item Details', { item })}
        >
          {/* Image of item */}
          <View style={styles.itemImageBox}>
            <Image
              source={typeof item.image === 'string' ? { uri: item.image } : item.image}
              style={styles.itemImage}
              resizeMode="cover"
            />
          </View>

          {/* Info inside the item overview box */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemPrice}>{item.priceRange}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/*
 Screen that will show the items details
 This also holds the pop up screen to input information to request a quote
 That means it has the functions to make sure the phone number or email is valid and will give an error message if it doesnt work
 This also has the function that sends the email to the company using emailjs (this is not completely functional yet)
 Finally it has the function to save the purchase history to the device using SecureStore
*/

function ItemDetailsScreen({ route }: any) {
const { item } = route.params as { item: Item };
 const [modalVisible, setModalVisible] = useState(false);
 const [name, setName] = useState('');
 const [contact, setContact] = useState('');
 const [specifications, setSpecifications] = useState('');

 const validateEmail = (email: string) => {
   const re = /\S+@\S+\.\S+/;
   return re.test(email);
 };

 const savePurchaseHistory = async (item: Item, specifications: string) => {
   try {
     const existing = await SecureStore.getItemAsync('purchaseHistory');
     const history = existing ? JSON.parse(existing) : [];
     // stores entries for 30 days
     const present = Date.now();
     const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
     const filteredHistory = history.filter((entry: any) => present - entry.timestamp < thirtyDaysMs);
     filteredHistory.push({ item: item.title, specifications, timestamp: present });
     await SecureStore.setItemAsync('purchaseHistory', JSON.stringify(filteredHistory));
   } catch (error) {
     console.error('Failed to save quote history', error);
   }
 };

  const handleSubmit = async () => {
   if (!name.trim()) {
     Alert.alert('Error', 'Enter your name.');
     return;
   }
   if (!contact.trim()) {
     Alert.alert('Error', 'Enter your email.');
     return;
   }
   if (!validateEmail(contact)) {
     Alert.alert('Error', 'Make sure your email is valid.');
     return;
   }
   if (!specifications.trim()) {
     Alert.alert('Error', 'Add specifications for the quote.');
     return;
   }

    await savePurchaseHistory(item, specifications);

    // Send the quote request to the Beequip API so it is stored in the database.
    // The local copy above is kept as a fallback if the server is unreachable.
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: contact.trim(),
          item: item.title,
          specifications: specifications.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      Alert.alert('Success', 'Quote request recieved, someone will be in contact soon!');
    } catch (error) {
      console.error('Error:', error);
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Warning',
        `Quote saved on this device, but failed to send to the server at ${API_BASE_URL}. ` +
          `Please check your connection. (${message})`
      );
    }

    setModalVisible(false);
    setName('');
    setContact('');
    setSpecifications('');
  };

    return (
      <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
        <ScrollView style={{paddingTop: 60}}>
         <TouchableOpacity style={styles.quoteButton} onPress={() => setModalVisible(true)}>
           <Text style={styles.quoteButtonText}>Request Quote</Text>
         </TouchableOpacity>
         <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.largeImage} />
         <View style={styles.detailsList}>
           <Text style={styles.detailItem}>Title: {item.title}</Text>
           <Text style={styles.detailItem}>Price Range: {item.priceRange}</Text>
           <Text style={styles.detailItem}>Description: {item.description}</Text>
         </View>
       </ScrollView>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Quote</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#a80000ff"
              value={name}
              onChangeText={setName}
            />
             <Text style={styles.label}>Email</Text>
             <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#a80000ff"
                value={contact}
                onChangeText={setContact}
              />
            <Text style={styles.label}>Details</Text>
            <TextInput
              style={[styles.input, styles.specificationsInput]}
              placeholder="Add any specifications for your quote."
              placeholderTextColor="#a80000ff"
              value={specifications}
               onChangeText={setSpecifications}
              multiline
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
             <Text style={styles.closeButtonText}>Close</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
    </ImageBackground>
  );
}

/*
contact us screen that has phone number and email
has image icons next to the text for icons
might add social media links later if the company want to
*/

function ContactUsScreen() {
  const { width } = Dimensions.get('window');
  const imageSize = width * 0.2;

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  return (
    <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.contactContent}>
        <Text style={styles.pageTitle}>Contact Us</Text>

        <TouchableOpacity style={styles.contactRow} onPress={() => copyToClipboard('beequip@mail.com', 'Email')}>
          <Image
            source={{ uri: 'https://illustoon.com/photo/dl/2753.png' }}
            style={[styles.contactImage, { width: imageSize, height: imageSize }]}
          />
          <Text style={styles.contactText}>Email: beequip@mail.com</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactRow} onPress={() => copyToClipboard('000-000-0000', 'Phone Number')}>
          <Image
            source={{ uri: 'https://illustoon.com/photo/dl/7599.png' }}
            style={[styles.contactImage, { width: imageSize, height: imageSize }]}
          />
          <Text style={styles.contactText}>Office: 111-111-1111</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactRow} onPress={() => copyToClipboard('000-000-0000', 'Phone Number')}>
          <Image
            source={{ uri: 'https://illustoon.com/photo/dl/7599.png' }}
            style={[styles.contactImage, { width: imageSize, height: imageSize }]}
          />
          <Text style={styles.contactText}>Service: 000-000-0000</Text>
         </TouchableOpacity>
       </ScrollView>
    </ImageBackground>
  );
}

/*
has the about us screen with placeholder text for the time being
this will have images of the company and employees and will talk a bit about the company and the owners
The image uris in this are blank because they are being used as spacers for the alternating text rows.
*/

function AboutUsScreen() {
  return (
    <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.aboutContent}>
        <Text style={styles.pageTitle}>About Beequip</Text>
        <View style={styles.topImageContainer}>
          <Image
            source={require('../../assets/images/teamwithcooler.jpg')}
            style={styles.topImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.row}>
          <Image
            source={{ uri: '' }}
            style={styles.rowImage}
          />
          <Text style={styles.rowText}>
            Beequip Products is a small oil and gas equipment founded in 2025. We are a company founded by long time industru professionals who wanted to provide a convenient third-party service for our customers.
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>
            We pride ourselves in our dedication to being efficient and reliable as business parteners. It is a guarentee that our products and service will always fulfill your needs.
          </Text>
          <Image
            source={{ uri: '' }}
            style={styles.rowImage}
          />
        </View>

        <View style={styles.row}>
          <Image
            source={{ uri: '' }}
            style={styles.rowImage}
          />
          <Text style={styles.rowText}>
            Thank you for choosing Beequip Products for your oil and gas equipment needs. We hope that you will reach out for any future oil and gas equipment needs. 
          </Text>
        </View>
       </ScrollView>
    </ImageBackground>
  );
}

/*
screen that holds the purchase history of the user
it uses secure store to store and output the history
there is a delete button on the right side to get rid of specific entries if the are unneeded
gets rid of entries older than 30 days no matter what
if save fails, it it will open history with previous data
*/

function PurchaseHistoryScreen() {
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await SecureStore.getItemAsync('purchaseHistory');
      if (data) {
        const parsed = JSON.parse(data);
        const now = Date.now();
        const thirtyDayTimer = 30 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((entry: any) => now - entry.timestamp < thirtyDayTimer);
        setHistory(filtered);
      }
    } catch (error) {
      console.error('Failed to load purchase history', error);
    }
  }, []);

  const deleteItem = useCallback(async (index: number) => {
    const deletedHistory = history.filter((_, i) => i !== index);
    setHistory(deletedHistory);
    try {
      await SecureStore.setItemAsync('purchaseHistory', JSON.stringify(deletedHistory));
    } catch (error) {
      console.error('Failed to save updated history', error);
      loadHistory();
    }
  }, [history, loadHistory]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  return (
    <ImageBackground source={require('../../assets/images/abstract-metal-texture-dark-gray-background.jpg')} style={styles.container} imageStyle={{opacity: 0.7}} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.historyContent}>
        <Text style={styles.pageTitle}>Purchase History</Text>
        {history.length === 0 ? (
          <Text style={styles.noHistoryText}>No purchase history available.</Text>
        ) : (
          history.map((item: any, index: number) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyItemContent}>
                <Text style={styles.historyItemTitle}>Item: {item.item}</Text>
                <Text style={styles.historyItemSpecifications}>specifications: {item.specifications}</Text>
                <Text style={styles.historyItemDate}>Date: {new Date(item.timestamp).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => Alert.alert(
                  'Delete entry',
                  'Are you sure you want to clear this entry?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteItem(index) },
                  ]
                )}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
         )}
       </ScrollView>
    </ImageBackground>
  );
}

/* Main app piece with drawer navigator as the base to get to everything else */

const drawer = createDrawerNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          header: (props) => <UniversalHeader {...props} />
        }}
      >
        <drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <drawer.Screen
          name="Shop"
          component={ShopStack}
          options={{ title: 'Shop' }}
        />
        <drawer.Screen
          name="Purchase History"
          component={PurchaseHistoryScreen}
          options={{ title: 'Purchase History' }}
        />
        <drawer.Screen
          name="Contact Us"
          component={ContactUsScreen}
          options={{ title: 'Contact Us' }}
        />
        <drawer.Screen
          name="About Beequip"
          component={AboutUsScreen}
          options={{ title: 'About Beequip' }}
        />
        </drawer.Navigator>
    </NavigationContainer>
  );
}

/* Style Sheet */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  carouselContainer: {
    width: '90%',
    height: 250,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#a80000ff',
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 16,
    color: '#a80000ff',
    lineHeight: 24,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  homeButton: {
    backgroundColor: '#a80000ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'rgba(8, 8, 129, 1)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDescription: {
    fontSize: 16,
    color: '#a80000ff',
    textAlign: 'center',
    lineHeight: 16,
  },
  aboutContent: {
    padding: 10,
  },
  topImageContainer: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#a80000ff',
    marginBottom: 20,
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  rowImage: {
    width: 60,
    height: 60,
    marginHorizontal: 10,
    backgroundColor: 'rgba(8, 8, 129, 1)',
  },
  rowText: {
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 10,
    color: '#a80000ff',
    lineHeight: 22,
  },
  contactContent: {
    padding: 20,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#a80000ff',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  contactImage: {
    marginRight: 20,
  },
  contactText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '500',
    color: 'rgba(11, 11, 145, 1)',
  },
  historyContent: {
    padding: 12,
  },
  noHistoryText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#a80000ff',
  },
  historyItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'rgba(8, 8, 129, 1)',
  },
  historyItemSpecifications: {
    fontSize: 16,
    marginBottom: 5,
    color: 'rgba(8, 8, 129, 1)',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#a80000ff',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inventoryCategoryView: {
    width: '50%',
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  shopContentCard: {
    width: '100%',
    height: '90%',
    borderWidth: 1,
    borderColor: '#000000ff',
    borderRadius: 5,
    padding: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  imageView: {
    width: '100%',
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a80000ff',
  },
  categoryButtonText: {
    color: 'rgba(8, 8, 129, 1)',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    position: 'relative',
    backgroundColor: 'rgba(8, 8, 129, 1)',
  },
  headerToggle: {
    position: 'absolute',
    left: 12,
    bottom: 0,
  },
  headerLogo: {
    bottom: 0,
  },
  headerHistory: {
    position: 'absolute',
    right: 12,
    bottom: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#a80000ff',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    color: 'rgba(8, 8, 129, 1)',
  },
  clearButton: {
    padding: 10,
    marginLeft: 5,
  },
  clearButtonText: {
    fontSize: 18,
    color: 'rgba(8, 8, 129, 1)',
  },
  headerMenuIcon: {
    fontSize: 36,
    fontWeight: '800',
    color: '#a80000ff',
  },
  itemListContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 5,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#a80000ff',
    padding: 10,
    marginBottom: 4,
    alignItems: 'center',
  },
  itemImageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: 'rgba(8, 8, 129, 1)',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff4444',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 20,
    color: 'rgba(8, 8, 129, 1)',
  },
  quoteButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    alignItems: 'center',
    margin: 10,
    borderRadius: 5,
  },
  quoteButtonText: {
    color: 'rgba(27, 27, 184, 1)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  largeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  detailsList: {
    padding: 20,
  },
  detailItem: {
    fontSize: 22,
    marginBottom: 12,
    color: 'rgba(12, 12, 194, 1)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    height: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#a80000ff'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#a80000ff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#a80000ff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  specificationsInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  submitButtonText: {
    color: 'rgba(27, 27, 184, 1)',
    fontSize: 16,
  },
  closeButton: {
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'rgba(8, 8, 129, 1)',
    fontSize: 16,
  },
  headerLogoImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  historyLogo:{
    fontSize: 30,

  },
  homeLogoImage: {
    width: 400,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});
