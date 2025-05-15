import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const BusinessInfo = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [licenseFileName, setLicenseFileName] = useState('');
  const [isLicensePdf, setIsLicensePdf] = useState(false);
  
  // Add refs for file inputs to properly handle them
  const logoInputRef = useRef();
  const licenseInputRef = useRef();
  
  // Watch the file inputs - removed as we're handling this differently now
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/settings/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setBusinessData(response.data);
        reset(response.data);
        setError(null);
        
        // Set preview URLs if they exist
        if (response.data.business_logo_url) {
          setLogoPreview(response.data.business_logo_url);
        }
        if (response.data.license_image_url) {
          const urlParts = response.data.license_image_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          setLicenseFileName(fileName);
          
          // Check if license is PDF
          const isPdf = fileName.toLowerCase().endsWith('.pdf');
          setIsLicensePdf(isPdf);
          
          if (!isPdf) {
            setLicensePreview(response.data.license_image_url);
          }
        }
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinessData();
  }, [reset]);

  // Remove these effects as we're handling file changes differently now

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Append all business data
      Object.keys(data).forEach(key => {
        if (key !== 'business_logo' && key !== 'license_image') {
          formData.append(key, data[key]);
        }
      });
      
      // Append files if they exist
      if (data.business_logo && data.business_logo[0]) {
        formData.append('business_logo', data.business_logo[0]);
      }
      if (data.license_image && data.license_image[0]) {
        formData.append('license_image', data.license_image[0]);
      }
      
      const response = await axios.put('http://localhost:8080/api/settings/profile', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsEditing(false);
      setBusinessData(response.data);
      
      // Update preview URLs if new images were uploaded
      if (response.data.business_logo_url) {
        setLogoPreview(response.data.business_logo_url);
      }
      
      if (response.data.license_image_url) {
        const urlParts = response.data.license_image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        setLicenseFileName(fileName);
        
        const isPdf = fileName.toLowerCase().endsWith('.pdf');
        setIsLicensePdf(isPdf);
        
        if (isPdf) {
          setLicensePreview(null);
        } else {
          setLicensePreview(response.data.license_image_url);
        }
      }
      
      alert('Business profile updated successfully');
    } catch (err) {
      console.error('Error updating business profile:', err);
      alert(err.response?.data?.error || 'Failed to update business profile');
    }
  };

  const handleLogoChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(businessData?.business_logo_url || null);
    }
  };

  const handleLicenseChange = (file) => {
    if (file) {
      setLicenseFileName(file.name);
      
      // Check if file is PDF
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      setIsLicensePdf(isPdf);
      
      if (isPdf) {
        setLicensePreview(null);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLicensePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setLicensePreview(businessData?.license_image_url || null);
      setLicenseFileName(businessData?.license_image_url ? 
        businessData.license_image_url.split('/').pop() : '');
      setIsLicensePdf(businessData?.license_image_url?.toLowerCase().endsWith('.pdf') || false);
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
        <h3 className="text-lg font-semibold text-gray-800">Business Information</h3>
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
              onClick={() => {
                setIsEditing(false);
                reset(businessData);
                setLogoPreview(businessData?.business_logo_url || null);
                setLicensePreview(businessData?.license_image_url || null);
                setLicenseFileName(businessData?.license_image_url ? 
                  businessData.license_image_url.split('/').pop() : '');
                setIsLicensePdf(businessData?.license_image_url?.toLowerCase().endsWith('.pdf') || false);
              }}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              form="businessForm"
              type="submit"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <form id="businessForm" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            {isEditing ? (
              <input
                {...register('business_name', { 
                  required: 'Business name is required',
                  maxLength: {
                    value: 225,
                    message: 'Business name cannot exceed 225 characters'
                  }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue={businessData?.business_name}
              />
            ) : (
              <p className="text-gray-900">{businessData?.business_name}</p>
            )}
            {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
              <p className="text-gray-900">{businessData?.business_email || 'Not provided'}</p>
            {errors.business_email && <p className="text-red-500 text-sm mt-1">{errors.business_email.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
            {isEditing ? (
              <input
                {...register('business_phone', { 
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
                defaultValue={businessData?.business_phone}
              />
            ) : (
              <p className="text-gray-900">{businessData?.business_phone || 'Not provided'}</p>
            )}
            {errors.business_phone && <p className="text-red-500 text-sm mt-1">{errors.business_phone.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <input
                {...register('address', { 
                  maxLength: {
                    value: 225,
                    message: 'Address cannot exceed 225 characters'
                  }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue={businessData?.address}
              />
            ) : (
              <p className="text-gray-900">{businessData?.address || 'Not provided'}</p>
            )}
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {isEditing ? (
              <input
                {...register('city', { 
                  maxLength: {
                    value: 225,
                    message: 'City cannot exceed 225 characters'
                  }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue={businessData?.city}
              />
            ) : (
              <p className="text-gray-900">{businessData?.city || 'Not provided'}</p>
            )}
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            {isEditing ? (
              <input
                {...register('country', { 
                  maxLength: {
                    value: 225,
                    message: 'Country cannot exceed 225 characters'
                  }
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue={businessData?.country}
              />
            ) : (
              <p className="text-gray-900">{businessData?.country || 'Not provided'}</p>
            )}
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
            {isEditing ? (
              <textarea
                {...register('business_description', { 
                  maxLength: {
                    value: 255,
                    message: 'Description cannot exceed 255 characters'
                  }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue={businessData?.business_description}
              />
            ) : (
              <p className="text-gray-900">{businessData?.business_description || 'Not provided'}</p>
            )}
            {errors.business_description && <p className="text-red-500 text-sm mt-1">{errors.business_description.message}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage</label>
              <p className="text-gray-900">{businessData?.commission_percentage !== null ? `${businessData.commission_percentage}%` : 'Not set'}</p>
            {errors.commission_percentage && <p className="text-red-500 text-sm mt-1">{errors.commission_percentage.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Logo</label>
            {isEditing ? (
              <div>
                {logoPreview && (
                  <div className="mb-2">
                    <img src={`http://localhost:8080${logoPreview}`} alt="Logo preview" className="h-20 w-20 object-contain border rounded" />
                  </div>
                )}
                <input
                  {...register('business_logo')}
                  type="file"
                  accept="image/*"
                  ref={logoInputRef}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLogoChange(e.target.files[0]);
                    }
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">Max size: 5MB (JPEG, JPG, PNG, GIF)</p>
              </div>
            ) : (
              logoPreview ? (
                <img src={`http://localhost:8080${logoPreview}`}alt="Business logo" className="h-20 w-20 object-contain border rounded" />
              ) : (
                <p className="text-gray-500">No logo uploaded</p>
              )
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business License</label>
            {isEditing ? (
              <div>
                {licensePreview ? (
                  <div className="mb-2">
                    <img src={licensePreview} alt="License preview" className="h-20 w-20 object-contain border rounded" />
                  </div>
                ) : licenseFileName && (
                  <div className="mb-2">
                    <div className="flex items-center p-2 border rounded bg-gray-50">
                      <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="ml-2 text-sm text-gray-700 truncate">{licenseFileName}</span>
                    </div>
                  </div>
                )}
                <input
                  {...register('license_image')}
                  type="file"
                  accept="image/*,.pdf"
                  ref={licenseInputRef}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLicenseChange(e.target.files[0]);
                    }
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">Max size: 5MB (JPEG, JPG, PNG, GIF, PDF)</p>
              </div>
            ) : (
              licensePreview ? (
                <img src={licensePreview} alt="Business license" className="h-20 w-20 object-contain border rounded" />
              ) : licenseFileName ? (
                <div className="flex items-center p-2 border rounded bg-gray-50">
                  <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="ml-2 text-sm text-gray-700">{licenseFileName}</span>
                </div>
              ) : (
                <p className="text-gray-500">No license uploaded</p>
              )
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Access</label>
              <p className="text-gray-900">{businessData?.has_ai_access ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BusinessInfo;