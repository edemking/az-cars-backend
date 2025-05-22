const { Role, PERMISSIONS } = require('../models/Role');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    sendSuccess(res, { data: roles });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Get single role
exports.getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return sendError(res, { 
        statusCode: 404, 
        message: 'Role not found' 
      });
    }
    sendSuccess(res, { data: role });
  } catch (error) {
    sendError(res, { message: error.message });
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
        return sendError(res, { 
          statusCode: 400, 
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          errors: { validPermissions }
        });
      }
    }
    
    const role = new Role({
      name,
      description,
      permissions: permissions || []
    });
    
    const newRole = await role.save();
    sendSuccess(res, { 
      statusCode: 201, 
      message: 'Role created successfully',
      data: newRole 
    });
  } catch (error) {
    sendError(res, { 
      statusCode: 400, 
      message: error.message 
    });
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
        return sendError(res, { 
          statusCode: 400, 
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
          errors: { validPermissions }
        });
      }
    }
    
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true, runValidators: true }
    );
    
    if (!role) {
      return sendError(res, { 
        statusCode: 404, 
        message: 'Role not found' 
      });
    }
    
    sendSuccess(res, { 
      message: 'Role updated successfully',
      data: role 
    });
  } catch (error) {
    sendError(res, { 
      statusCode: 400, 
      message: error.message 
    });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return sendError(res, { 
        statusCode: 404, 
        message: 'Role not found' 
      });
    }
    
    // Check if role is being used by any users before deleting
    const User = require('../models/User');
    const usersWithRole = await User.countDocuments({ role: req.params.id });
    
    if (usersWithRole > 0) {
      return sendError(res, { 
        statusCode: 400, 
        message: `Cannot delete role. It's currently assigned to ${usersWithRole} user(s).`
      });
    }
    
    await Role.findByIdAndDelete(req.params.id);
    sendSuccess(res, { message: 'Role deleted successfully' });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Get all available permissions
exports.getPermissions = async (req, res) => {
  try {
    sendSuccess(res, { data: PERMISSIONS });
  } catch (error) {
    sendError(res, { message: error.message });
  }
}; 