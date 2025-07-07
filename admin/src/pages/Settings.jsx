import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/slices/uiSlice';
import { 
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  ShieldCheckIcon,
  UserIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'appearance', name: 'Appearance', icon: ComputerDesktopIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
  ];

  const handleThemeChange = (newTheme) => {
    if (newTheme !== theme) {
      dispatch(toggleTheme());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-base-content">Settings</h1>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-base-100 rounded-lg shadow-md">
            <div className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-base-content hover:bg-base-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-base-100 rounded-lg shadow-md p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Platform Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        defaultValue="BlogAdda"
                        disabled
                      />
                      <label className="label">
                        <span className="label-text-alt">The name of your blogging platform</span>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Default Language</span>
                      </label>
                      <select className="select select-bordered">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Time Zone</span>
                      </label>
                      <select className="select select-bordered">
                        <option>UTC</option>
                        <option>EST</option>
                        <option>PST</option>
                        <option>GMT</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Theme</span>
                      </label>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleThemeChange('light')}
                          className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                        >
                          <SunIcon className="w-4 h-4 mr-2" />
                          Light
                        </button>
                        <button
                          onClick={() => handleThemeChange('dark')}
                          className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                        >
                          <MoonIcon className="w-4 h-4 mr-2" />
                          Dark
                        </button>
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Dashboard Layout</span>
                      </label>
                      <select className="select select-bordered">
                        <option>Default</option>
                        <option>Compact</option>
                        <option>Expanded</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Show sidebar by default</span>
                        <input type="checkbox" className="checkbox" defaultChecked />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Email notifications for new users</span>
                        <input type="checkbox" className="checkbox" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Email notifications for reported content</span>
                        <input type="checkbox" className="checkbox" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Email notifications for new blog posts</span>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Push notifications</span>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Require two-factor authentication</span>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Auto-logout after inactivity</span>
                        <input type="checkbox" className="checkbox" defaultChecked />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Session timeout (minutes)</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        defaultValue="30"
                        min="5"
                        max="1440"
                      />
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label">
                        <span className="label-text">Log security events</span>
                        <input type="checkbox" className="checkbox" defaultChecked />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        defaultValue={user?.name || ''}
                        disabled
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered"
                        defaultValue={user?.email || ''}
                        disabled
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Role</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        defaultValue={user?.role || ''}
                        disabled
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Change Password</span>
                      </label>
                      <button className="btn btn-outline">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
