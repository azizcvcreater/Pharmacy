import {
  MdDashboard,
  MdLocalPharmacy,
  MdMoneyOff,
  MdLocalHospital,
} from 'react-icons/md';
import { FaBoxes, FaShoppingCart, FaShoppingBag } from 'react-icons/fa';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { FiUsers } from 'react-icons/fi';

export const navItems = [
  { to: '/', icon: MdDashboard, label: 'Dashboard', roles: ['admin'] },
  { to: '/user', icon: FiUsers, label: 'Users', roles: ['admin'] },
  { to: '/doc', icon: MdLocalHospital, label: 'Doctor', roles: ['admin'] },
  {
    to: '/pharmacy',
    icon: MdLocalPharmacy,
    label: 'Pharmacy',
    roles: ['super_admin'],
  },
  { to: '/medicine', icon: FaBoxes, label: 'Stock', roles: ['admin', 'staff'] },
  {
    to: '/items',
    icon: AiOutlinePlusCircle,
    label: 'Items',
    roles: ['admin', 'staff'],
  },
  {
    to: '/purchase',
    icon: FaShoppingCart,
    label: 'Purchase',
    roles: ['admin', 'staff'],
  },
  {
    to: '/sale',
    icon: FaShoppingBag,
    label: 'Sale',
    roles: ['admin', 'staff'],
  },
  { to: '/expense', icon: MdMoneyOff, label: 'Expense', roles: ['admin'] },
  {
    to: '/suppliers',
    icon: FiUsers,
    label: 'Suppliers',
    roles: ['admin', 'staff'],
  },
  {
    to: '/payments',
    icon: RiExchangeDollarLine,
    label: 'Payments',
    roles: ['admin', 'staff'],
  },
];
