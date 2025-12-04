const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo
config.watchFolders = [workspaceRoot];

// Let Metro find packages in monorepo
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Ensure workspace packages are resolved correctly
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
