import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import {
  User, FileText, Phone, Calendar, Award, MapPin, Building2, Camera, Plus, Trash2, Loader2
} from 'lucide-react';

const DEFAULT_PROFILE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" rx="100" fill="#cbd5e1"/>
    <circle cx="100" cy="76" r="34" fill="#64748b"/>
    <path d="M46 164c10-28 31-42 54-42s44 14 54 42" fill="#64748b"/>
  </svg>
`)}`;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState('');
  const [locationOptions, setLocationOptions] = useState({
    countries: [],
    states: [],
    cities: []
  });
  const [tempInputs, setTempInputs] = useState({
    weblinks: '',
    skills: '',
    interests: '',
    coreValues: '',
    languagesKnown: '',
    awards: '',
    careerTitle: '',
    careerDescription: '',
    careerStart: '',
    careerEnd: '',
    careerType: 'professional'
  });

  const normalizeListField = useCallback((value) => {
    if (Array.isArray(value)) {
      return value
        .flatMap(item => (typeof item === 'string' ? item.split(',') : []))
        .map(item => item.trim())
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }

    return [];
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      if (response.data.success) {
        const processedData = { ...response.data.user };
        // Process arrays for display
        ['weblinks', 'skills', 'interests', 'coreValues', 'languagesKnown', 'awards'].forEach(field => {
          processedData[field] = normalizeListField(processedData[field]);
        });
        setProfileData(processedData);
      }
    } catch (err) {
      console.error('Profile fetch error:', err.response?.data || err.message || err);
      setError(`Failed to load profile: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [normalizeListField]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    let isActive = true;

    const loadCountries = async () => {
      const { Country } = await import('country-state-city');
      if (!isActive) return;

      setLocationOptions((prev) => ({
        ...prev,
        countries: Country.getAllCountries()
      }));
    };

    loadCountries();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadStates = async () => {
      const selectedCountry = locationOptions.countries.find((country) => country.name === (profileData.contactInfo?.country || ''));

      if (!selectedCountry) {
        if (isActive) {
          setLocationOptions((prev) => ({ ...prev, states: [], cities: [] }));
        }
        return;
      }

      const { State } = await import('country-state-city');
      if (!isActive) return;

      setLocationOptions((prev) => ({
        ...prev,
        states: State.getStatesOfCountry(selectedCountry.isoCode),
        cities: []
      }));
    };

    loadStates();

    return () => {
      isActive = false;
    };
  }, [locationOptions.countries, profileData.contactInfo?.country]);

  useEffect(() => {
    let isActive = true;

    const loadCities = async () => {
      const selectedCountry = locationOptions.countries.find((country) => country.name === (profileData.contactInfo?.country || ''));
      const selectedState = locationOptions.states.find((state) => state.name === (profileData.contactInfo?.state || ''));

      if (!selectedCountry || !selectedState) {
        if (isActive) {
          setLocationOptions((prev) => ({ ...prev, cities: [] }));
        }
        return;
      }

      const { City } = await import('country-state-city');
      if (!isActive) return;

      setLocationOptions((prev) => ({
        ...prev,
        cities: City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
      }));
    };

    loadCities();

    return () => {
      isActive = false;
    };
  }, [locationOptions.countries, locationOptions.states, profileData.contactInfo?.country, profileData.contactInfo?.state]);

  const commaItems = (str) => {
    return normalizeListField(str);
  };

  const formatDisplayDate = useCallback((value) => {
    if (!value) return '';

    const normalizedValue = typeof value === 'string' && value.includes('T')
      ? value.split('T')[0]
      : value;

    const date = new Date(normalizedValue);
    if (Number.isNaN(date.getTime())) {
      return normalizedValue;
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const updateNestedField = useCallback((path, value) => {
    setProfileData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current = newData;
      const pathArr = path.split('.');
      for (let i = 0; i < pathArr.length - 1; i++) {
        const key = pathArr[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }
      current[pathArr[pathArr.length - 1]] = value;
      return newData;
    });
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  }, []);

  const setTempInput = useCallback((field, value) => {
    setTempInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const addItem = useCallback((field) => {
    const value = tempInputs[field]?.trim();
    if (!value) return;
    setProfileData(prev => ({
      ...prev,
      [field]: [...normalizeListField(prev[field]), value]
    }));
    setTempInputs(prev => ({ ...prev, [field]: '' }));
  }, [normalizeListField, tempInputs]);

  const removeItem = useCallback((field, index) => {
    setProfileData(prev => ({
      ...prev,
      [field]: normalizeListField(prev[field]).filter((_, i) => i !== index)
    }));
  }, [normalizeListField]);

  const addCareer = useCallback(() => {
    if (!tempInputs.careerTitle?.trim()) return;
    setProfileData(prev => ({
      ...prev,
      careerJourney: [...(prev.careerJourney || []), {
        type: tempInputs.careerType,
        title: tempInputs.careerTitle.trim(),
        description: tempInputs.careerDescription?.trim() || '',
        startDate: tempInputs.careerStart,
        endDate: tempInputs.careerEnd
      }]
    }));
    setTempInputs(prev => ({
      ...prev,
      careerTitle: '',
      careerDescription: '',
      careerStart: '',
      careerEnd: ''
    }));
  }, [tempInputs]);

  const removeCareer = useCallback((index) => {
    setProfileData(prev => ({
      ...prev,
      careerJourney: prev.careerJourney?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const handleImageUpload = useCallback(async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const response = await userAPI.uploadProfileImage(formData);
      if (response.data.success) {
        setProfileData(prev => ({ ...prev, profileImage: response.data.profileImage }));
        setImagePreview(URL.createObjectURL(file));
      }
    } catch (err) {
      setError(`Upload failed - ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const toggleAddressSame = useCallback((e) => {
    const same = e.target.checked;
    setProfileData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        sameAsCurrent: same,
        permanentAddress: same ? (prev.contactInfo?.currentAddress || '') : (prev.contactInfo?.permanentAddress || '')
      }
    }));
  }, []);

  const handleCountryChange = useCallback((value) => {
    setProfileData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        country: value,
        state: '',
        city: ''
      }
    }));
  }, []);

  const handleStateChange = useCallback((value) => {
    setProfileData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        state: value,
        city: ''
      }
    }));
  }, []);

  const handleSave = useCallback(async () => {
    const saveData = { ...profileData };
    ['weblinks', 'skills', 'interests', 'coreValues', 'languagesKnown', 'awards'].forEach(field => {
      saveData[field] = normalizeListField(saveData[field]);
    });
    
    setSaving(true);
    setError('');
    try {
      const response = await userAPI.updateProfile(saveData);
      if (response.data.success) {
        updateUser(response.data.user);
        fetchProfile(); // Refresh to get arrays back
      } else {
        setError('Save failed - ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Save failed - ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }, [normalizeListField, profileData, updateUser, fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen p-8">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" />
        <span className="text-lg">Loading your profile...</span>
      </div>
    );
  }

  const { countries, states, cities } = locationOptions;
  const selectedCountry = countries.find((country) => country.name === (profileData.contactInfo?.country || ''));
  const selectedState = states.find((state) => state.name === (profileData.contactInfo?.state || ''));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
              Your Profile
            </h1>
            <p className="text-xl text-slate-600 mt-2">Complete your professional showcase</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="lg:self-start px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-3xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 whitespace-nowrap"
          >
            {saving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Saving...
              </>
            ) : (
              'Save All Changes'
            )}
          </button>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-3xl text-red-800 animate-pulse shadow-xl">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Save Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50">
              <div className="text-center">
                <div className="relative group">
                  <img 
src={imagePreview || (profileData.profileImage ? `/uploads/${profileData.profileImage}` : DEFAULT_PROFILE_IMAGE)}
                    alt="Profile" 
                    className="w-40 h-40 mx-auto rounded-full object-cover border-8 border-white shadow-2xl group-hover:shadow-3xl transition-all duration-300" 
                  />
                  <label className="absolute -bottom-3 right-4 bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full cursor-pointer shadow-2xl border-4 border-white hover:scale-110 hover:shadow-3xl transition-all duration-300">
                    <Camera className="w-6 h-6 text-white" />
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={uploadLoading}
                      className="hidden" 
                    />
                  </label>
                </div>
                <h2 className="text-3xl font-bold mt-6 text-slate-900">{profileData.name || 'Your Name'}</h2>
                <p className="text-xl text-slate-600 mt-1 capitalize">{profileData.userType || 'Student'}</p>
                {uploadLoading && <p className="text-sm text-blue-600 mt-4 font-medium flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </p>}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* 1. Basic Details */}
            <section className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/50">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-4 text-slate-900">
                <User className="w-12 h-12 text-blue-600 bg-blue-100 p-3 rounded-2xl" />
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="block text-lg font-semibold mb-4 text-slate-700">First Name</label>
                  <input name="firstName" value={profileData.firstName || ''} onChange={handleChange} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Middle Name</label>
                  <input name="middleName" value={profileData.middleName || ''} onChange={handleChange} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Last Name</label>
                  <input name="lastName" value={profileData.lastName || ''} onChange={handleChange} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Date of Birth</label>
                  <input type="date" name="dob" value={profileData.dob ? profileData.dob.split('T')[0] : ''} onChange={handleChange} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Gender</label>
                  <select name="gender" value={profileData.gender || ''} onChange={handleChange} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-inner">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Marital Status</label>
                  <select name="maritalStatus" value={profileData.maritalStatus || ''} onChange={handleChange} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-inner">
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Email</label>
                  <input name="email" value={profileData.email || ''} readOnly className="w-full p-5 border-2 border-slate-200 rounded-2xl bg-slate-100 cursor-not-allowed shadow-inner" />
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Phone</label>
                  <input name="phone" value={profileData.phone || ''} readOnly className="w-full p-5 border-2 border-slate-200 rounded-2xl bg-slate-100 cursor-not-allowed shadow-inner" />
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Weblinks</label>
                  <div className="flex gap-4">
                    <input 
                      value={tempInputs.weblinks} 
                      onChange={(e) => setTempInput('weblinks', e.target.value)}
                      placeholder="e.g. linkedin.com/in/yourname" 
                      className="flex-1 p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all" 
                    />
                    <button 
                      onClick={() => addItem('weblinks')}
                      className="px-8 py-5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Plus className="w-6 h-6" />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-6">
                    {Array.isArray(profileData.weblinks) ? profileData.weblinks.map((link, i) => (
                      <span key={i} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-2xl text-sm font-medium shadow-md flex items-center gap-2 hover:bg-blue-200 transition-all">
                        {link}
                        <button onClick={() => removeItem('weblinks', i)} className="text-red-500 hover:text-red-700 p-1 rounded-xl hover:bg-red-100 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </span>
                    )) : commaItems(profileData.weblinks || '').map((link, i) => (
                      <span key={i} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-2xl text-sm font-medium shadow-md flex items-center gap-2 hover:bg-blue-200 transition-all">
                        {link}
                        <button onClick={() => removeItem('weblinks', i)} className="text-red-500 hover:text-red-700 p-1 rounded-xl hover:bg-red-100 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Professional Summary */}
            <section className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/50">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-4 text-slate-900">
                <FileText className="w-12 h-12 text-green-600 bg-green-100 p-3 rounded-2xl" />
                Professional Summary
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Summary</label>
                  <textarea name="summary" value={profileData.summary || ''} onChange={handleChange} rows={6} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all shadow-inner resize-vertical">
                  </textarea>
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-4 text-slate-700">Roles & Responsibilities</label>
                  <textarea name="rolesResponsibilities" value={profileData.rolesResponsibilities || ''} onChange={handleChange} rows={6} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all shadow-inner resize-vertical">
                  </textarea>
                </div>
              </div>
              {/* Chips - Vertical Stack */}
              <div className="flex flex-col gap-8 mt-12 pt-12 border-t-4 border-green-100">
                {[
                  { field: 'skills', label: 'Skills & Expertise', color: 'green' },
                  { field: 'interests', label: 'Interests', color: 'purple' },
                  { field: 'coreValues', label: 'Core Values', color: 'blue' },
                  { field: 'languagesKnown', label: 'Languages', color: 'orange' }
                ].map(({ field, label, color }) => (
                  <div key={field}>
                    <label className="block text-lg font-semibold mb-3 text-slate-700 capitalize">{label}</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        value={tempInputs[field]} 
                        onChange={(e) => setTempInput(field, e.target.value)}
                        placeholder={`Add ${label.toLowerCase()}...`} 
                        className={`flex-1 p-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-${color}-200 focus:border-${color}-500 transition-all`} 
                      />
                      <button 
                        onClick={() => addItem(field)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 h-24 overflow-y-auto p-2 bg-slate-50/80 rounded-xl border border-slate-200/50">
                      {Array.isArray(profileData[field]) ? profileData[field].map((item, i) => (
                        <span key={i} className={`px-3 py-1.5 bg-${color}-100 text-${color}-700 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-${color}-200 transition-all shadow-sm`}>
                          {item}
                          <button onClick={() => removeItem(field, i)} className="text-red-500 hover:text-red-600 p-0.5 rounded hover:bg-red-100 transition-all ml-auto">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                      )) : commaItems(profileData[field] || '').map((item, i) => (
                        <span key={i} className={`px-3 py-1.5 bg-${color}-100 text-${color}-700 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-${color}-200 transition-all shadow-sm`}>
                          {item}
                          <button onClick={() => removeItem(field, i)} className="text-red-500 hover:text-red-600 p-0.5 rounded hover:bg-red-100 transition-all ml-auto">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Career Journey */}
            <section className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/50">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-4 text-slate-900">
                <Building2 className="w-12 h-12 text-purple-600 bg-purple-100 p-3 rounded-2xl" />
                Career Journey
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl mb-10">
                <select value={tempInputs.careerType} onChange={(e) => setTempInput('careerType', e.target.value)} className="p-5 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500">
                  <option value="professional">Professional Experience</option>
                  <option value="education">Educational Milestone</option>
                </select>
                <input value={tempInputs.careerTitle} onChange={(e) => setTempInput('careerTitle', e.target.value)} placeholder="Position/Title" className="p-5 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" />
                <input type="date" value={tempInputs.careerStart} onChange={(e) => setTempInput('careerStart', e.target.value)} className="p-5 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" />
                <input type="date" value={tempInputs.careerEnd} onChange={(e) => setTempInput('careerEnd', e.target.value)} className="p-5 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500" />
                <textarea value={tempInputs.careerDescription} onChange={(e) => setTempInput('careerDescription', e.target.value)} placeholder="Achievements" rows="3" className="md:col-span-2 p-5 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 resize-none">
                </textarea>
                <button onClick={addCareer} className="md:col-span-2 p-5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-3">
                  <Plus className="w-8 h-8" />
                  Add Milestone
                </button>
              </div>
              <div className="space-y-6">
                {profileData.careerJourney && profileData.careerJourney.map((milestone, index) => (
                  <div key={index} className="flex gap-6 p-8 bg-gradient-to-r from-gray-50 to-slate-100 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-gray-200">
                    <div className={`w-4 h-4 rounded-full mt-4 flex-shrink-0 ${milestone.type === 'professional' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">{milestone.title}</h3>
                      <p className="text-lg text-slate-700 mb-4 leading-relaxed">{milestone.description}</p>
                      <p className="text-xl text-slate-500">
                        {formatDisplayDate(milestone.startDate)} - {milestone.endDate ? formatDisplayDate(milestone.endDate) : 'Present'}
                      </p>
                    </div>
                    <button onClick={() => removeCareer(index)} className="text-red-500 hover:text-red-700 p-4 rounded-2xl hover:bg-red-50 transition-all shadow-md hover:shadow-lg self-start">
                      <Trash2 className="w-8 h-8" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Awards */}
            <section className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/50">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-4 text-slate-900">
                <Award className="w-12 h-12 text-amber-600 bg-amber-100 p-3 rounded-2xl" />
                Awards & Recognition
              </h2>
              <div className="flex gap-6 mb-10">
                <input 
                  value={tempInputs.awards} 
                  onChange={(e) => setTempInput('awards', e.target.value)}
                  placeholder="e.g. Hackathon Winner 2023" 
                  className="flex-1 p-5 border-2 border-amber-200 rounded-2xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all" 
                />
                <button 
                  onClick={() => addItem('awards')}
                  className="px-12 py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3"
                >
                  <Award className="w-8 h-8" />
                </button>
              </div>
              <div className="flex flex-wrap gap-6">
                {Array.isArray(profileData.awards) ? profileData.awards.map((award, i) => (
                  <span key={i} className="px-8 py-5 bg-amber-100 text-amber-800 rounded-2xl text-xl font-bold shadow-xl flex items-center gap-4 hover:bg-amber-200 transition-all">
                    <Award className="w-10 h-10" />
                    {award}
                    <button onClick={() => removeItem('awards', i)} className="text-red-500 hover:text-red-700 p-3 rounded-2xl hover:bg-red-100 transition-all ml-auto">
                      <Trash2 className="w-8 h-8" />
                    </button>
                  </span>
                )) : commaItems(profileData.awards || '').map((award, i) => (
                  <span key={i} className="px-8 py-5 bg-amber-100 text-amber-800 rounded-2xl text-xl font-bold shadow-xl flex items-center gap-4 hover:bg-amber-200 transition-all">
                    <Award className="w-10 h-10" />
                    {award}
                    <button onClick={() => removeItem('awards', i)} className="text-red-500 hover:text-red-700 p-3 rounded-2xl hover:bg-red-100 transition-all ml-auto">
                      <Trash2 className="w-8 h-8" />
                    </button>
                  </span>
                ))}
              </div>
            </section>

            {/* 5. Contact Info */}
            <section className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/50">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-4 text-slate-900">
                <MapPin className="w-12 h-12 text-indigo-600 bg-indigo-100 p-3 rounded-2xl" />
                Contact Information
              </h2>
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-3xl">
                  <input
                    type="checkbox"
                    checked={profileData.contactInfo?.sameAsCurrent || false}
                    onChange={toggleAddressSame}
                    className="w-6 h-6 rounded-2xl border-4 border-indigo-300 focus:ring-indigo-500 bg-white"
                  />
                  <label className="text-xl font-semibold text-slate-800 cursor-pointer select-none flex-1">
                    Current & Permanent address are the same
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-semibold mb-4 text-slate-700">Country</label>
                    <select
                      value={profileData.contactInfo?.country || ''}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all shadow-inner"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.isoCode} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-lg font-semibold mb-4 text-slate-700">State</label>
                    <select
                      value={profileData.contactInfo?.state || ''}
                      onChange={(e) => handleStateChange(e.target.value)}
                      disabled={!selectedCountry}
                      className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all shadow-inner disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">{selectedCountry ? 'Select State' : 'Select Country First'}</option>
                      {states.map((state) => (
                        <option key={state.isoCode} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-lg font-semibold mb-4 text-slate-700">City</label>
                    <select
                      value={profileData.contactInfo?.city || ''}
                      onChange={(e) => updateNestedField('contactInfo.city', e.target.value)}
                      disabled={!selectedCountry || !selectedState}
                      className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all shadow-inner disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">{selectedState ? 'Select City' : 'Select State First'}</option>
                      {cities.map((city) => (
                        <option key={`${city.name}-${city.stateCode || ''}-${city.countryCode || ''}`} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-lg font-semibold mb-4 text-slate-700">Postal Code</label>
                    <input value={profileData.contactInfo?.postalCode || ''} onChange={(e) => updateNestedField('contactInfo.postalCode', e.target.value)} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all shadow-inner" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-lg font-semibold mb-4 text-slate-700">Current Address</label>
                    <textarea value={profileData.contactInfo?.currentAddress || ''} onChange={(e) => updateNestedField('contactInfo.currentAddress', e.target.value)} rows={4} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all shadow-inner resize-vertical">
                    </textarea>
                  </div>
                  {!profileData.contactInfo?.sameAsCurrent && (
                    <div className="md:col-span-2">
                      <label className="block text-lg font-semibold mb-4 text-slate-700">Permanent Address</label>
                      <textarea value={profileData.contactInfo?.permanentAddress || ''} onChange={(e) => updateNestedField('contactInfo.permanentAddress', e.target.value)} rows={4} className="w-full p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all shadow-inner resize-vertical">
                      </textarea>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

