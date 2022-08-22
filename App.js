/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Button,
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Picker } from '@react-native-picker/picker';
import { stringToBytes } from "convert-string";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

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
  const [desligado, setDesligado] = useState(false);
  const [operador, setOperador] = useState('');
  const [quarto, setQuarto] = useState('');
  const [text, setText] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');


  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 3, false)
        .then(results => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };

  const handleDisconnectedPeripheral = data => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
    console.log('Disconnected from ' + data.peripheral);
  };

  const handleUpdateValueForCharacteristic = data => {
    console.log(
      'Received data from ' +
      data.peripheral +
      ' characteristic ' +
      data.characteristic,
      data.value,
    );
  };

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length === 0) {
        console.log('No connected peripherals');
      }
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });
  };

  const handleDiscoverPeripheral = peripheral => {
    // console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    setList(Array.from(peripherals.values()));
    // console.log('peri', peripherals);
    const scanned = list.map((d) => ({ name: d.name, id: d.id }))
    console.log(scanned);
  };

  const testPeripheral = peripheral => {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id)
          .then(() => {
            let p = peripherals.get(peripheral.id);
            if (p) {
              p.connected = true;
              peripherals.set(peripheral.id, p);
              setList(Array.from(peripherals.values()));
            }
            console.log('Connected to ' + peripheral.id);

            setTimeout(() => {
              /* Test read current RSSI value */
              BleManager.retrieveServices(peripheral.id).then(
                peripheralData => {
                  console.log('Retrieved peripheral services', peripheralData);

                  BleManager.readRSSI(peripheral.id).then(rssi => {
                    console.log('Retrieved actual RSSI value', rssi);
                    let p = peripherals.get(peripheral.id);
                    if (p) {
                      p.rssi = rssi;
                      peripherals.set(peripheral.id, p);
                      setList(Array.from(peripherals.values()));
                    }
                  });
                },
              );
            }, 900);
          })
          .catch(error => {
            console.log('Connection error', error);
          });
      }
    }
  };

  useEffect(() => {
    BleManager.start({ showAlert: false });

    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleDisconnectedPeripheral,
    );
    bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleUpdateValueForCharacteristic,
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(result => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log('User accept');
            } else {
              console.log('User refuse');
            }
          });
        }
      });
    }

    return () => {
      console.log('unmount');
      bleManagerEmitter.removeListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      );
      bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
      bleManagerEmitter.removeListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedPeripheral,
      );
      bleManagerEmitter.removeListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleUpdateValueForCharacteristic,
      );
    };
  }, []);

  const ligarEquipamento = () => {
    setDesligado(!desligado);

    if (!desligado) {
      if (selectedDevice.connected) {
        const data = stringToBytes('Olá');
        const serviceUUID = '42A8A87A-F71C-446B-B81D-0CD16A709625'
        const characteristicUUID = 'BD6120BD-3612-4D56-8957-99F5D6F02C52'
        BleManager.write(
          selectedDevice.id,
          serviceUUID,
          characteristicUUID,
          data,
        );
      }
      setText(`Quarto: ${quarto}\r\nOperador: ${operador}\r\nHorário: ${new Date(Date.now())}`)
    } else {
      setText('')
    }
  };

  return (
    <View style={styles.view}>
      <View style={styles.row}>
        <View style={styles.col2}>
          <Text style={styles.text}>Quarto</Text>
          <TextInput
            editable={!desligado}
            style={styles.input}
            onChangeText={text => setQuarto(text)}
          />
        </View>
        <View style={styles.col2}>
          <Text style={styles.text}>Operador</Text>
          <TextInput
            editable={!desligado}
            style={styles.input}
            onChangeText={text => setOperador(text)}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col2Picker}>
          <Picker
            accessibilityValue={true}
            style={{ height: 20 }}
            selectedValue={selectedDevice}
            onValueChange={(itemValue, itemindex) => {
              testPeripheral(itemValue)
            }}
          >
            {list.map((data, i) => (
              <Picker.Item label={data.name} value={data} />
            ))}
          </Picker>
        </View>
        <View style={styles.col2Button}>
          <Button
            onPress={() => {
              startScan()
            }}
            disabled={isScanning}
            title={'Buscar Equipamento'}
          />
        </View>
      </View>
      <View style={styles.onButtonRow}>
        <Button
          style={styles.onButton}
          onPress={ligarEquipamento}
          title={desligado ? 'Desligar' : 'Ligar'}
        />
      </View>
      <View style={styles.row}>
        <TextInput
          multiline={true}
          numberOfLines={10}
          editable={false}
          value={text}
          style={styles.inputMulti}
        />
      </View>
      <View style={styles.row}>
        <Button
          title={'Gerar Relatório'}
        />
      </View>
    </View>
  );
};

const spacing = {
  '3xs': 2,
  '2xs': 4,
  'xs': 8,
  'sm': 12,
  'md': 16,
  'lg': 24,
  'xl': 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 100,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  onButtonRow: {
    marginTop: 10,
    margin: 10,
    justifyContent: 'center',
  },
  col2: {
    width: '48%',
  },
  col2Picker: {
    width: '48%',
    marginTop: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
  },
  col2Button: {
    width: '48%',
    marginTop: 20,
  },
  onButton: {
    width: '100%',
  },
  text: {
    color: 'black',
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: 'black',
    height: spacing['2xl'],
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    marginTop: spacing.xs,
    paddingLeft: 10,
  },
  inputMulti: {
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginTop: 10,
  },
});

export default App;
