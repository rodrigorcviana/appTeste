//importing all react native core libraries to use into our application.
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Picker } from '@react-native-picker/picker';

const bts = [
  {
    name: 'tv',
    rssi: -30,
  },
  {
    name: 'fone',
    rssi: -20,
  },
  {
    name: 'carro',
    rssi: -35,
  }
];

const App = () => {
  const [state, setState] = useState("");

  return (
    <View>
      <Picker
        selectedValue={state}
        onValueChange={(itemValue, intemindex) => { 
          setState(itemValue)
        }}
      >
        {bts.map((data, i) => (
          <Picker.Item label={data.name} value={data.name}/>
        ))}
      </Picker>
    </View>
  );
}
const customeStyles = StyleSheet.create({
  pickerCustomeStyle: {
    height: 50,
    width: "80%",
    color: "green",
    justifyContent: "center"
  }
});

export default App;