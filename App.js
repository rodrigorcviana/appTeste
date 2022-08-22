/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import { View, StyleSheet, Text, TextInput, Button, Modal } from 'react-native';

const App = () => {
  const [modal, setModal] = useState(false);
  return (

    <View style={styles.view}>
      <Modal
        visible={modal}
        animationType={'slide'}
        style={{ justifyContent: 'center' }}
      >
        <View style={styles.modalView}>
          <Text style={styles.text}>
            teste
          </Text>
        </View>
      </Modal>
      <View style={styles.row}>
        <View style={styles.col2}>
          <Text style={styles.text}>Quarto</Text>
          <TextInput style={styles.input} />
        </View>
        <View style={styles.col2}>
          <Text style={styles.text}>Operador</Text>
          <TextInput style={styles.input} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col2}>
          <Button
            title={'Parear Equipamento'}
            onPress={() => setModal(!modal)}
          />
        </View>
        <View style={styles.col2}>
          <Button title={'Ligar'} />
        </View>
      </View>
      <View style={styles.row}>
        <TextInput
          multiline={true}
          numberOfLines={10}
          editable={false}
          value={'olá'}
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
  col2: {
    width: '48%',
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
