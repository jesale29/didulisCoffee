const Inventory = require('../models/Inventory');
const fs = require('fs');

class InventoryController {
    
    /**
     * GET /inventory
     * Lists all non-archived coffee products.
     */
    async index(req, res) {
        try {
            // Uses the Eloquent-style static 'all' method
            const items = await Inventory.all();
            res.render('inventory/index', { title: 'Inventory List', items });
        } catch (err) {
            console.error("❌ Inventory Index Error:", err);
            res.status(500).render('errors/500', { message: err.message });
        }
    }

    /**
     * GET /inventory/create
     */
    create(req, res) {
        res.render('inventory/create', { title: 'Add New Item', item: null });
    }

    /**
     * POST /inventory
     * Handles product creation and image pathing.
     */
    async store(req, res) {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).send("Form data missing.");
            }

            let imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

            const productData = {
                sku: req.body.sku,
                name: req.body.name,
                description: req.body.description || null,
                quantity: parseInt(req.body.quantity) || 0,
                price: parseFloat(req.body.price) || 0.0,
                image_url: imageUrl
            };

            // Eloquent: Inventory::create(data)
            const newItem = await Inventory.create(productData);

            // Log activity globally
            await Inventory.logActivity({
                userId: req.user ? req.user.id : null,
                resourceId: newItem.id,
                actionType: 'CREATE',
                newData: newItem,
                description: `Product ${newItem.name} added to inventory.`
            });

            req.flash('success_msg', 'Product created successfully!');
            res.redirect('/inventory');
        } catch (err) {
            console.error("❌ Inventory Store Error:", err);
            res.status(500).send("Failed to create product: " + err.message);
        }
    }

    /**
     * GET /inventory/:id/edit
     */
    async edit(req, res) {
        try {
            const item = await Inventory.find(req.params.id);
            if (!item) return res.status(404).render('errors/404');
            
            res.render('inventory/edit', { title: 'Edit Item', item });
        } catch (err) {
            res.status(500).send("Item not found");
        }
    }

    /**
     * POST /inventory/:id (Update)
     * Handles data updates and old image cleanup.
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const oldItem = await Inventory.find(id);
            if (!oldItem) return res.status(404).send("Product not found");

            let imageUrl = oldItem.image_url;

            if (req.file) {
                imageUrl = `/uploads/products/${req.file.filename}`;
                
                // Cleanup: Delete the old local file if it exists
                if (oldItem.image_url && oldItem.image_url.startsWith('/uploads/')) {
                    const oldPath = `./public${oldItem.image_url}`;
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
            }

            const updatedData = {
                name: req.body.name,
                description: req.body.description || null,
                quantity: parseInt(req.body.quantity) || 0,
                price: parseFloat(req.body.price) || 0.0,
                image_url: imageUrl
            };

            const result = await Inventory.update(id, updatedData);

            // Global Activity Log
            await Inventory.logActivity({
                userId: req.user ? req.user.id : null,
                resourceId: id,
                actionType: 'UPDATE',
                oldData: oldItem,
                newData: result,
                description: `Updated product: ${result.name}`
            });

            req.flash('success_msg', 'Product updated!');
            res.redirect('/inventory');
        } catch (err) {
            console.error("❌ Inventory Update Error:", err);
            res.status(500).send("Update failed");
        }
    }

    /**
     * DELETE /inventory/:id
     * Soft-deletes the item via the base Model 'archive' method.
     */
    async destroy(req, res) {
        try {
            // Using the archive method from Model.js for soft-delete + log
            await Inventory.archive(req.params.id, req.user ? req.user.id : null, 'Product removed from active inventory.');
            
            req.flash('success_msg', 'Item moved to archives.');
            res.redirect('/inventory');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
}

// Export a singleton instance
module.exports = new InventoryController();