/**
 * PublicController Class
 * Handles non-authenticated, static, and informational routes.
 */
class PublicController {
    
    /**
     * GET /
     * Renders the landing page for Didulis Coffee.
     */
    getHome(req, res) {
        res.render('home', { 
            // Corrected 'tile' typo to 'title'
            title: "Home | Diduli's Coffee Inc.",
            pageTitle: 'Didulis Coffee - Home',
            layout: 'layout/layout' 
        });
    }

    /**
     * GET /about
     * Renders the company history and legacy page.
     */
    getAbout(req, res) {
        res.render('about', { 
            title: "About Us | Didulis Coffee",
            pageTitle: 'About Our Legacy',
            layout: 'layout/layout' 
        });
    }

    /**
     * GET /contact
     * Renders the contact form and location details.
     */
    getContact(req, res) {
        res.render('contact', { 
            title: "Contact Us | Didulis Coffee",
            pageTitle: 'Get in Touch',
            layout: 'layout/layout' 
        });
    }
}

// Export as a singleton instance
module.exports = new PublicController();