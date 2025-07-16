const browserSync = require('browser-sync').create();

// Browser-Sync configuration for LLG Design System
browserSync.init({
  server: {
    baseDir: './dist',
    index: 'index.html'
  },
  
  // Network settings
  host: '0.0.0.0',
  port: 3000,
  ui: {
    port: 3001
  },
  
  // File watching
  files: [
    'dist/**/*',
    'src/**/*'
  ],
  
  // Options
  open: false,
  notify: false,
  logLevel: 'info',
  logPrefix: 'LLG',
  
  // Ghost mode settings
  ghostMode: {
    clicks: true,
    forms: true,
    scroll: true
  },
  
  // Middleware for development
  middleware: [
    {
      route: '/api',
      handle: function (req, res, next) {
        // Mock API responses for development
        res.setHeader('Content-Type', 'application/json');
        
        if (req.url === '/api/contact') {
          res.end(JSON.stringify({
            success: true,
            message: 'Message sent successfully!'
          }));
        } else {
          res.end(JSON.stringify({
            error: 'API endpoint not found'
          }));
        }
      }
    }
  ],
  
  // Reload delay
  reloadDelay: 1000,
  
  // Browser settings
  browser: ['chrome', 'firefox', 'safari'],
  
  // HTTPS settings (for testing)
  https: false,
  
  // Tunnel settings (for external testing)
  tunnel: false,
  
  // Snippet settings
  snippet: true,
  
  // Inject changes
  injectChanges: true,
  
  // Timestamps
  timestamps: true,
  
  // Custom callbacks
  callbacks: {
    ready: function(err, bs) {
      console.log('\n🚀 LLG Design System Development Server');
      console.log('📱 Local:    http://localhost:3000');
      console.log('🌐 External: http://' + bs.options.get('host') + ':3000');
      console.log('⚙️  UI:       http://localhost:3001');
      console.log('\n📋 Available on your network:');
      
      // Get network interfaces
      const os = require('os');
      const interfaces = os.networkInterfaces();
      
      Object.keys(interfaces).forEach(function(devName) {
        const iface = interfaces[devName];
        iface.forEach(function(alias) {
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
            console.log('   http://' + alias.address + ':3000');
          }
        });
      });
      
      console.log('\n✨ Ready for cross-device testing!\n');
    }
  }
});

// Export for programmatic usage
module.exports = browserSync;
