# BlogAdda Admin Panel

A modern, responsive admin dashboard for managing the BlogAdda blogging platform.

## Features

- **Dashboard Overview**: Get insights into user activity, blog statistics, and moderation queue
- **User Management**: View, search, and moderate user accounts
- **Blog Management**: Review, feature, and moderate blog posts
- **Comment Moderation**: Handle reported comments and inappropriate content
- **Settings**: Configure admin preferences and platform settings
- **Real-time Updates**: Live statistics and notifications
- **Dark/Light Theme**: Toggle between themes for better user experience

## Tech Stack

- **Frontend**: React 18, Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS, DaisyUI
- **Icons**: Heroicons
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

## Build for Production

```bash
npm run build
```

## Admin Login

The admin panel requires admin or moderator privileges. Use the following credentials:

- **Email**: admin@blogadda.com
- **Password**: admin123

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── DashboardLayout.jsx
│   │       ├── Header.jsx
│   │       └── Sidebar.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── BlogManagement.jsx
│   │   ├── CommentManagement.jsx
│   │   ├── UserDetails.jsx
│   │   ├── BlogDetails.jsx
│   │   ├── Settings.jsx
│   │   ├── Login.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authAPI.js
│   │   └── adminAPI.js
│   ├── store/
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── userSlice.js
│   │       ├── blogSlice.js
│   │       ├── commentSlice.js
│   │       └── uiSlice.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## API Integration

The admin panel communicates with the backend API at `http://localhost:5000/api`. Make sure the backend server is running before using the admin panel.

## Key Features

### Dashboard

- Overview statistics (users, blogs, comments)
- Growth metrics and trends
- Recent activity feed
- Moderation queue alerts
- Top authors and trending content

### User Management

- User listing with pagination
- Search and filter capabilities
- User ban/unban functionality
- Detailed user profiles
- Activity tracking

### Blog Management

- Blog listing with status filters
- Content moderation
- Feature/unfeature blogs
- Delete inappropriate content
- Blog analytics

### Comment Moderation

- Reported comments review
- Bulk moderation actions
- Comment deletion
- Context viewing

### Settings

- Theme preferences
- Notification settings
- Security configurations
- Profile management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
