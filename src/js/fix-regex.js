// src/js/fix-regex.js
// This runs BEFORE any imports to catch regex errors

(function fixInvalidRegex() {
    console.log('🔧 Installing regex fixer...');
    
    const originalRegExp = RegExp;
    const originalTest = RegExp.prototype.test;
    const originalExec = RegExp.prototype.exec;
    
    // Catch RegExp constructor
    window.RegExp = function(pattern, flags) {
        if (flags && typeof flags === 'string') {
            // Check for invalid 'e' flag
            if (flags.includes('e')) {
                console.warn('⚠️ Invalid regex flag "e" detected, removing it');
                console.warn('Pattern:', pattern);
                console.warn('Original flags:', flags);
                // Remove the 'e' flag
                flags = flags.replace(/e/g, '');
                if (!flags) flags = undefined;
            }
        }
        return new originalRegExp(pattern, flags);
    };
    window.RegExp.prototype = originalRegExp.prototype;
    
    // Patch RegExp.prototype.test
    RegExp.prototype.test = function(str) {
        try {
            return originalTest.call(this, str);
        } catch(e) {
            console.error('❌ Regex test failed:', this, e);
            return false;
        }
    };
    
    // Patch RegExp.prototype.exec
    RegExp.prototype.exec = function(str) {
        try {
            return originalExec.call(this, str);
        } catch(e) {
            console.error('❌ Regex exec failed:', this, e);
            return null;
        }
    };
    
    console.log('✅ Regex fixer installed');
})();