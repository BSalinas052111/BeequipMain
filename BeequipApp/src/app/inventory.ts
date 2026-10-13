import { ImageSourcePropType } from 'react-native';

export type Item = {
  id: string;
  title: string;
  priceRange: string;
  image: ImageSourcePropType;
  description: string;
};

/* placeholder data for inventory items */
export const NewEquipment: Item[] = [
  {
    image: require('../../assets/images/120 Cooler 2.png'),
    id: '01',
    title: '120 VV Engine Driven Cooler',
    priceRange: '~$170,000',
    description: 'with 304 stainless tubes, metalized headers, galvanized frames',
  },
  {
    image: require('../../assets/images/ElectricCoolers.jpg'),
    id: '02',
    title: '120 VV Electric Cooler',
    priceRange: '~$114,995',
    description: 'with 304 stainless tubes, metalized headers and galvanized frames',
  },
];

export const UsedEquipment: Item[] = [
  {
    image: require('../../assets/images/ElectricCoolers.jpg'),
    id: '03',
    title: '108 VV Electric Cooler',
    priceRange: '~$80,000',
    description: 'with 304 Stainless Steel Tubes, metalized headers and galvanized frames',
  },
  {
    image: require('../../assets/images/120 Cooler 1.png'),
    id: '04',
    title: '108 VV Engine Driven Cooler',
    priceRange: '~$144,500',
    description: 'with 304 Stainless Steel Tubes, metalized headers and galvanized frames',
  },
];

export const ProcessEquipment: Item[] = [
  {
    image: require('../../assets/images/trailercooler.jpg'),
    id: '05',
    title: 'Earth',
    priceRange: '$00.00',
    description: 'pen',
  },
];

export const RentalEquipment: Item[] = [
  {
    image: require('../../assets/images/trailercooler.jpg'),
    id: '06',
    title: 'Double 90 ZF Electric Cooler',
    priceRange: '~$10,000.00/mo',
    description: 'trailer mounted 316 ss tubes, galvanized frames, metalized headers. includes vfd panel',
  },
];

export default {
  NewEquipment,
  UsedEquipment,
  ProcessEquipment,
  RentalEquipment,
};