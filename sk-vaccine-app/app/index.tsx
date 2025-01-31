import { Text, View } from 'react-native';
import logger from '@/utils/logger';
import { useEffect, useState } from 'react';


type ClinicData = {
  name: string;
  address: string;
}

export default function Index() {
  const [clinicData, setClinicData] = useState<ClinicData[]>([]);

  async function getClinicData() {
    try {
      const response = await fetch('http://10.0.2.2:3000/testdata');
      const json = await response.json();
      logger.info('Clinic data received');
      setClinicData(json.clinics);
    } catch (error) {
      logger.error('Failed to get Clinic data', error);
      setClinicData([]);
    }
  }

  useEffect(() => {
    getClinicData();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {clinicData.length > 0 ? (
        clinicData?.map((clinic, index) => (
          <Text key={index} style={{ marginBottom: 10 }}>
            {clinic.name} - {clinic.address}
          </Text>
        ))
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}
