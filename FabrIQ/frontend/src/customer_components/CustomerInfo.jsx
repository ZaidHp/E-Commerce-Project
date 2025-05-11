// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import axios from 'axios';

// const CustomerInfo = () => {
//   const { register, handleSubmit, formState: { errors }, reset } = useForm();
//   const [addresses, setAddresses] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showAddressForm, setShowAddressForm] = useState(false);
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await axios.get('/api/user/profile');
//         setUserData(response.data.user);
//         setAddresses(response.data.addresses);
//         reset(response.data.user);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };
    
//     fetchUserData();
//   }, [reset]);

//   const onSubmit = async (data) => {
//     try {
//       await axios.put('/api/user/profile', data);
//       setIsEditing(false);
//       setUserData(prev => ({ ...prev, ...data }));
//     } catch (error) {
//       console.error('Error updating profile:', error);
//     }
//   };

//   const handleAddAddress = async (addressData) => {
//     try {
//       const response = await axios.post('/api/user/address', addressData);
//       setAddresses([...addresses, response.data]);
//       setShowAddressForm(false);
//     } catch (error) {
//       console.error('Error adding address:', error);
//     }
//   };

//   const handleDeleteAddress = async (addressId) => {
//     try {
//       await axios.delete(`/api/user/address/${addressId}`);
//       setAddresses(addresses.filter(addr => addr.address_id !== addressId));
//     } catch (error) {
//       console.error('Error deleting address:', error);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
//         {!isEditing ? (
//           <button
//             onClick={() => setIsEditing(true)}
//             className="text-indigo-600 hover:text-indigo-800 font-medium"
//           >
//             Edit
//           </button>
//         ) : (
//           <div className="space-x-2">
//             <button
//               onClick={() => setIsEditing(false)}
//               className="text-gray-600 hover:text-gray-800 font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               form="profileForm"
//               type="submit"
//               className="text-indigo-600 hover:text-indigo-800 font-medium"
//             >
//               Save
//             </button>
//           </div>
//         )}
//       </div>

//       <form id="profileForm" onSubmit={handleSubmit(onSubmit)}>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
//             {isEditing ? (
//               <input
//                 {...register('first_name', { required: 'First name is required' })}
//                 type="text"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             ) : (
//               <p className="text-gray-900">{userData?.first_name}</p>
//             )}
//             {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//             {isEditing ? (
//               <input
//                 {...register('last_name', { required: 'Last name is required' })}
//                 type="text"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             ) : (
//               <p className="text-gray-900">{userData?.last_name}</p>
//             )}
//             {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
//           </div>
          
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <p className="text-gray-900">{userData?.email}</p>
//           </div>
//         </div>
//       </form>

//       <div className="border-t border-gray-200 pt-6">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
//           <button
//             onClick={() => setShowAddressForm(true)}
//             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Add New Address
//           </button>
//         </div>

//         {showAddressForm && (
//           <AddressForm 
//             onCancel={() => setShowAddressForm(false)} 
//             onSubmit={handleAddAddress} 
//           />
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {addresses.map(address => (
//             <AddressCard 
//               key={address.address_id} 
//               address={address} 
//               onDelete={handleDeleteAddress} 
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// const AddressForm = ({ onCancel, onSubmit }) => {
//   const { register, handleSubmit, formState: { errors } } = useForm();

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="mb-6 bg-gray-50 p-4 rounded-lg">
//       <div className="grid grid-cols-1 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
//           <select
//             {...register('address_type', { required: 'Address type is required' })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="Home">Home</option>
//             <option value="Office">Office</option>
//             <option value="Other">Other</option>
//           </select>
//           {errors.address_type && <p className="text-red-500 text-sm mt-1">{errors.address_type.message}</p>}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//           <textarea
//             {...register('address', { required: 'Address is required' })}
//             rows={3}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//           {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
//             <input
//               {...register('city', { required: 'City is required' })}
//               type="text"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
//             <input
//               {...register('country', { required: 'Country is required' })}
//               type="text"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//           <input
//             {...register('phone_number', { 
//               required: 'Phone number is required',
//               pattern: {
//                 value: /^[0-9+\- ]+$/,
//                 message: 'Invalid phone number'
//               }
//             })}
//             type="text"
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//           {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>}
//         </div>
        
//         <div className="flex justify-end space-x-3 pt-2">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Save Address
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// };

// const AddressCard = ({ address, onDelete }) => {
//   return (
//     <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors">
//       <div className="flex justify-between">
//         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//           {address.address_type}
//         </span>
//         <button
//           onClick={() => onDelete(address.address_id)}
//           className="text-gray-400 hover:text-red-500"
//           aria-label="Delete address"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//           </svg>
//         </button>
//       </div>
//       <div className="mt-2">
//         <p className="text-sm text-gray-800">{address.address}</p>
//         <p className="text-sm text-gray-600">{address.city}, {address.country}</p>
//         <p className="text-sm text-gray-600 mt-1">Phone: {address.phone_number}</p>
//       </div>
//     </div>
//   );
// };

// export default CustomerInfo;

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const CustomerInfo = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setUserData(response.data.user);
        setAddresses(response.data.addresses);
        reset(response.data.user);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      await axios.put('http://localhost:8080/api/user/profile', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setIsEditing(false);
      setUserData(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/user/address', addressData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setAddresses([...addresses, response.data]);
      setShowAddressForm(false);
    } catch (err) {
      console.error('Error adding address:', err);
      alert('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`http://localhost:8080/api/user/address/${addressId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setAddresses(addresses.filter(addr => addr.address_id !== addressId));
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Edit
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              form="profileForm"
              type="submit"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <form id="profileForm" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            {isEditing ? (
              <input
                {...register('first_name', { 
                  required: 'First name is required',
                  maxLength: {
                    value: 50,
                    message: 'First name cannot exceed 50 characters'
                  }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue={userData?.first_name}
              />
            ) : (
              <p className="text-gray-900">{userData?.first_name}</p>
            )}
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            {isEditing ? (
              <input
                {...register('last_name', { 
                  required: 'Last name is required',
                  maxLength: {
                    value: 50,
                    message: 'Last name cannot exceed 50 characters'
                  }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue={userData?.last_name}
              />
            ) : (
              <p className="text-gray-900">{userData?.last_name}</p>
            )}
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{userData?.email}</p>
          </div>
        </div>
      </form>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
          <button
            onClick={() => setShowAddressForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New Address
          </button>
        </div>

        {showAddressForm && (
          <AddressForm 
            onCancel={() => setShowAddressForm(false)} 
            onSubmit={handleAddAddress} 
          />
        )}

        {addresses.length === 0 ? (
          <p className="text-gray-500">No saved addresses yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(address => (
              <AddressCard 
                key={address.address_id} 
                address={address} 
                onDelete={handleDeleteAddress} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AddressForm = ({ onCancel, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
          <select
            {...register('address_type', { required: 'Address type is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select address type</option>
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
          {errors.address_type && <p className="text-red-500 text-sm mt-1">{errors.address_type.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            {...register('address', { 
              required: 'Address is required',
              maxLength: {
                value: 500,
                message: 'Address cannot exceed 500 characters'
              }
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              {...register('city', { 
                required: 'City is required',
                maxLength: {
                  value: 100,
                  message: 'City cannot exceed 100 characters'
                }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              {...register('country', { 
                required: 'Country is required',
                maxLength: {
                  value: 100,
                  message: 'Country cannot exceed 100 characters'
                }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            {...register('phone_number', { 
              required: 'Phone number is required',
              pattern: {
                value: /^[0-9+\- ]+$/,
                message: 'Invalid phone number format'
              },
              maxLength: {
                value: 20,
                message: 'Phone number cannot exceed 20 characters'
              }
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>}
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Address
          </button>
        </div>
      </div>
    </form>
  );
};

const AddressCard = ({ address, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors">
      <div className="flex justify-between">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {address.address_type}
        </span>
        {confirmDelete ? (
          <div className="space-x-2">
            <button
              onClick={() => onDelete(address.address_id)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-gray-400 hover:text-red-500"
            aria-label="Delete address"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-800">{address.address}</p>
        <p className="text-sm text-gray-600">{address.city}, {address.country}</p>
        <p className="text-sm text-gray-600 mt-1">Phone: {address.phone_number}</p>
      </div>
    </div>
  );
};

export default CustomerInfo;