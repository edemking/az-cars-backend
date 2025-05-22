const { Role, PERMISSIONS } = require('../models/Role');

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single role
exports.getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Validate that all permissions are valid
    if (permissions && permissions.length > 0) {
      const validPermissions = Object.values(PERMISSIONS);
      const invalidPermissions = permissions.filter(
        permission => !validPermissions.includes(permission)
      );
      
      if (invalidPermissions.length > 0) {
        return res.status(400).json({ 
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          validPermissions
        });
      }
    }
    
    const role = new Role({
      name,
      description,
      permissions: permissions || []
    });
    
    const newRole = await role.save();
    res.status(201).json(newRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Validate permissions if they're being updated
    if (permissions && permissions.length > 0) {
      const validPermissions = Object.values(PERMISSIONS);
      const invalidPermissions = permissions.filter(
        permission => !validPermissions.includes(permission)
      );
      
      if (invalidPermissions.length > 0) {
        return res.status(400).json({ 
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          validPermissions
        });
      }
    }
    
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true, runValidators: true }
    );
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if role is being used by any users before deleting
    const User = require('../models/User');
    const usersWithRole = await User.countDocuments({ role: req.params.id });
    
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. It's currently assigned to ${usersWithRole} user(s).`
      });
    }
    
    await Role.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available permissions
exports.getPermissions = async (req, res) => {
  try {
    res.status(200).json(PERMISSIONS);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 