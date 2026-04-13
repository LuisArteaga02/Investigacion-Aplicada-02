import { StyleSheet, Text, View } from 'react-native';
import Sensores from './components/sensores';
// You can import supported modules from npm
import Modelos from './components/modelo3d';


export default function App() {
  return (
    <View style={styles.container}>
      <Sensores>
      </Sensores>
<Modelos>
</Modelos>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
