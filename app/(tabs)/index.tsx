//version11//
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const STORAGE_KEY = "WARDROBE_ITEMS";

const CATEGORIES = ["Tops","Bottoms","Shoes","Accessories"];

export default function App() {

  const [screen,setScreen] = useState("home");
  const [items,setItems] = useState([]);

  const [name,setName] = useState("");
  const [category,setCategory] = useState("Tops");
  const [image,setImage] = useState(null);

  const [search,setSearch] = useState("");

  useEffect(()=>{
    loadItems();
  },[]);

  const loadItems = async()=>{
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if(data) setItems(JSON.parse(data));
  }

  const saveStorage = async(data)=>{
    await AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(data));
  }

  const takePhoto = async()=>{

    const perm = await ImagePicker.requestCameraPermissionsAsync();

    if(!perm.granted){
      Alert.alert("Camera permission needed");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality:0.7
    });

    if(!result.canceled){
      setImage(result.assets[0].uri);
    }

  }

  const pickGallery = async()=>{

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if(!perm.granted){
      Alert.alert("Gallery permission needed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality:0.7
    });

    if(!result.canceled){
      setImage(result.assets[0].uri);
    }

  }

  const saveItem = async()=>{

    if(!name || !image){
      Alert.alert("Add name and image");
      return;
    }

    const newItem = {
      id:Date.now().toString(),
      name,
      category,
      image,
      status:"clean",
      wearCount:0
    }

    const updated = [newItem,...items];

    setItems(updated);
    saveStorage(updated);

    setName("");
    setImage(null);

    setScreen("home");

  }

  const markWorn = async(id)=>{

    const updated = items.map(i=>{
      if(i.id===id){
        return{
          ...i,
          status:"worn",
          wearCount:i.wearCount+1
        }
      }
      return i;
    });

    setItems(updated);
    saveStorage(updated);

  }

  const laundryReset = async()=>{

    const updated = items.map(i=>({
      ...i,
      status:"clean"
    }));

    setItems(updated);
    saveStorage(updated);

    Alert.alert("Laundry done","All clothes set to clean");

  }

  const deleteItem = async(id)=>{

    const updated = items.filter(i=>i.id!==id);

    setItems(updated);
    saveStorage(updated);

  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const total = items.length;
  const clean = items.filter(i=>i.status==="clean").length;
  const worn = items.filter(i=>i.status==="worn").length;

  if(screen==="add"){

    return(

      <SafeAreaView style={s.container}>

        <Text style={s.title}>Add Clothing</Text>

        <View style={s.imageBox}>

          {image ?
            <Image source={{uri:image}} style={s.preview}/>
            :
            <Text style={{color:"#999"}}>No Image</Text>
          }

        </View>

        <View style={s.row}>

          <TouchableOpacity style={s.btn} onPress={takePhoto}>
            <Text>📷 Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.btn} onPress={pickGallery}>
            <Text>🖼 Gallery</Text>
          </TouchableOpacity>

        </View>

        <TextInput
          placeholder="Clothing name"
          value={name}
          onChangeText={setName}
          style={s.input}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

          {CATEGORIES.map(cat=>(

            <TouchableOpacity
              key={cat}
              style={[s.chip,category===cat && s.activeChip]}
              onPress={()=>setCategory(cat)}
            >

              <Text>{cat}</Text>

            </TouchableOpacity>

          ))}

        </ScrollView>

        <TouchableOpacity style={s.saveBtn} onPress={saveItem}>
          <Text style={{color:"#fff"}}>Save Item</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>setScreen("home")}>
          <Text style={{marginTop:20}}>Cancel</Text>
        </TouchableOpacity>

      </SafeAreaView>

    )

  }

  return(

    <SafeAreaView style={s.container}>

      <Text style={s.title}>ClosetAI</Text>

      <View style={s.stats}>

        <View style={s.statCard}>
          <Text style={s.statNumber}>{total}</Text>
          <Text>Total</Text>
        </View>

        <View style={s.statCard}>
          <Text style={s.statNumber}>{clean}</Text>
          <Text>Clean</Text>
        </View>

        <View style={s.statCard}>
          <Text style={s.statNumber}>{worn}</Text>
          <Text>Worn</Text>
        </View>

      </View>

      <TextInput
        placeholder="Search clothes..."
        value={search}
        onChangeText={setSearch}
        style={s.input}
      />

      <TouchableOpacity style={s.addButton} onPress={()=>setScreen("add")}>
        <Text style={{color:"#fff"}}>+ Add Clothing</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.laundryButton} onPress={laundryReset}>
        <Text>Laundry Done</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={item=>item.id}
        renderItem={({item})=>(

          <View style={s.card}>

            <Image source={{uri:item.image}} style={s.image}/>

            <View style={{flex:1}}>

              <Text style={s.name}>{item.name}</Text>

              <Text style={{color:"#666"}}>{item.category}</Text>

              <Text style={{
                color:item.status==="clean"?"green":"red"
              }}>
                {item.status}
              </Text>

              <Text style={{fontSize:12}}>
                Worn {item.wearCount} times
              </Text>

              <TouchableOpacity onPress={()=>markWorn(item.id)}>
                <Text style={{color:"#007AFF"}}>Mark Worn</Text>
              </TouchableOpacity>

            </View>

            <TouchableOpacity onPress={()=>deleteItem(item.id)}>
              <Text style={{fontSize:18}}>🗑</Text>
            </TouchableOpacity>

          </View>

        )}
      />

    </SafeAreaView>

  )

}

const s = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F6F7FB",
padding:20
},

title:{
fontSize:28,
fontWeight:"bold",
marginBottom:15
},

stats:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:15
},

statCard:{
backgroundColor:"#fff",
padding:15,
borderRadius:12,
alignItems:"center",
width:"30%"
},

statNumber:{
fontSize:20,
fontWeight:"bold"
},

input:{
backgroundColor:"#fff",
padding:12,
borderRadius:10,
marginBottom:10
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginVertical:10
},

btn:{
backgroundColor:"#eee",
padding:12,
borderRadius:10,
width:"48%",
alignItems:"center"
},

addButton:{
backgroundColor:"#000",
padding:14,
borderRadius:10,
alignItems:"center",
marginBottom:10
},

laundryButton:{
backgroundColor:"#ddd",
padding:12,
borderRadius:10,
alignItems:"center",
marginBottom:10
},

card:{
backgroundColor:"#fff",
flexDirection:"row",
padding:12,
borderRadius:12,
marginBottom:10,
alignItems:"center"
},

image:{
width:70,
height:70,
borderRadius:10,
marginRight:10
},

preview:{
width:200,
height:200,
borderRadius:12
},

imageBox:{
height:200,
backgroundColor:"#eee",
borderRadius:12,
justifyContent:"center",
alignItems:"center",
marginBottom:10
},

name:{
fontSize:16,
fontWeight:"bold"
},

chip:{
backgroundColor:"#eee",
padding:10,
borderRadius:20,
marginRight:8
},

activeChip:{
backgroundColor:"#ccc"
}

});