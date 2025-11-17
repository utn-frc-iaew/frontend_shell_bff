/**
 * Pruebas de Validación de Arquitectura
 * Valida que cada componente cumpla con sus responsabilidades
 */

const fs = require('fs');
const path = require('path');

describe('Arquitectura BFF + Microservicios', () => {
  
  describe('Portal Shell - Responsabilidades', () => {
    const portalShellPath = path.join(__dirname, '../shell/portal-shell');
    
    test('Debe tener configuración de Auth0', () => {
      const layoutPath = path.join(portalShellPath, 'src/app/layout.tsx');
      expect(fs.existsSync(layoutPath)).toBe(true);
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('UserProvider');
    });

    test('Debe tener menú dinámico basado en roles', () => {
      const menuPath = path.join(portalShellPath, 'src/components/DynamicMenu.tsx');
      expect(fs.existsSync(menuPath)).toBe(true);
      const content = fs.readFileSync(menuPath, 'utf-8');
      expect(content).toContain('roles');
      expect(content).toContain('filter');
    });

    test('NO debe tener conexión directa a MongoDB', () => {
      const packagePath = path.join(portalShellPath, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      expect(packageContent).not.toContain('mongoose');
      expect(packageContent).not.toContain('mongodb');
    });

    test('NO debe llamar APIs internas directamente', () => {
      const srcPath = path.join(portalShellPath, 'src');
      const files = getAllFiles(srcPath);
      const contents = files.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
      expect(contents).not.toContain('localhost:5001');
      expect(contents).not.toContain('localhost:5002');
    });
  });

  describe('BFF Shell - Responsabilidades', () => {
    const bffShellPath = path.join(__dirname, '../shell/bff-shell');
    
    test('Debe validar JWT de usuarios', () => {
      const authPath = path.join(bffShellPath, 'src/middleware/auth.ts');
      expect(fs.existsSync(authPath)).toBe(true);
      const content = fs.readFileSync(authPath, 'utf-8');
      expect(content).toContain('auth0');
      expect(content).toContain('jwt');
    });

    test('Debe gestionar tokens B2B', () => {
      const tokenPath = path.join(bffShellPath, 'src/services/tokenService.ts');
      expect(fs.existsSync(tokenPath)).toBe(true);
      const content = fs.readFileSync(tokenPath, 'utf-8');
      expect(content).toContain('client_credentials');
      expect(content).toContain('cache');
    });

    test('NO debe tener conexión directa a MongoDB', () => {
      const packagePath = path.join(bffShellPath, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      expect(packageContent).not.toContain('mongoose');
      expect(packageContent).not.toContain('mongodb');
    });

    test('Debe llamar a APIs internas con token B2B', () => {
      const srcPath = path.join(bffShellPath, 'src');
      const files = getAllFiles(srcPath);
      const contents = files.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
      expect(contents).toContain('API_USER_URL');
      expect(contents).toContain('API_CUSTOMER_URL');
    });
  });

  describe('Portal Child 1 - Responsabilidades', () => {
    const portalChildPath = path.join(__dirname, '../portal-child/portal-child-1');
    
    test('Debe usar Auth0 con PKCE', () => {
      const mainPath = path.join(portalChildPath, 'src/main.tsx');
      expect(fs.existsSync(mainPath)).toBe(true);
      const content = fs.readFileSync(mainPath, 'utf-8');
      expect(content).toContain('Auth0Provider');
    });

    test('Debe tener TanStack Query para caché', () => {
      const packagePath = path.join(portalChildPath, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      expect(packageContent).toContain('@tanstack/react-query');
    });

    test('NO debe tener conexión directa a MongoDB', () => {
      const packagePath = path.join(portalChildPath, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      expect(packageContent).not.toContain('mongoose');
      expect(packageContent).not.toContain('mongodb');
    });

    test('Solo debe comunicarse con bff-child-1', () => {
      const bffClientPath = path.join(portalChildPath, 'src/services/bffClient.ts');
      expect(fs.existsSync(bffClientPath)).toBe(true);
      const content = fs.readFileSync(bffClientPath, 'utf-8');
      expect(content).toContain('BFF_URL');
      expect(content).not.toContain('API_USER');
      expect(content).not.toContain('API_CUSTOMER');
    });
  });

  describe('BFF Child 1 - Responsabilidades', () => {
    const bffChildPath = path.join(__dirname, '../portal-child/bff-child-1');
    
    test('Debe validar JWT de usuarios', () => {
      const authPath = path.join(bffChildPath, 'src/middleware/auth.ts');
      expect(fs.existsSync(authPath)).toBe(true);
      const content = fs.readFileSync(authPath, 'utf-8');
      expect(content).toContain('auth0');
    });

    test('Debe gestionar tokens B2B', () => {
      const tokenPath = path.join(bffChildPath, 'src/services/tokenService.ts');
      expect(fs.existsSync(tokenPath)).toBe(true);
      const content = fs.readFileSync(tokenPath, 'utf-8');
      expect(content).toContain('client_credentials');
    });

    test('NO debe tener conexión directa a MongoDB', () => {
      const packagePath = path.join(bffChildPath, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      expect(packageContent).not.toContain('mongoose');
      expect(packageContent).not.toContain('mongodb');
    });
  });

  describe('API User - Responsabilidades', () => {
    const apiUserPath = path.join(__dirname, '../api-user');
    
    test('Debe tener conexión directa a MongoDB', () => {
      const packagePath = path.join(apiUserPath, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      expect(packageContent).toContain('mongoose');
    });

    test('Debe tener arquitectura por capas (schema, service, controller)', () => {
      const schemaPath = path.join(apiUserPath, 'src/users/schemas/user.schema.ts');
      const servicePath = path.join(apiUserPath, 'src/users/users.service.ts');
      const controllerPath = path.join(apiUserPath, 'src/users/users.controller.ts');
      
      expect(fs.existsSync(schemaPath)).toBe(true);
      expect(fs.existsSync(servicePath)).toBe(true);
      expect(fs.existsSync(controllerPath)).toBe(true);
    });

    test('Debe validar SOLO tokens B2B (no JWT de usuarios)', () => {
      const guardPath = path.join(apiUserPath, 'src/auth/auth.guard.ts');
      expect(fs.existsSync(guardPath)).toBe(true);
      const content = fs.readFileSync(guardPath, 'utf-8');
      expect(content).toContain('express-oauth2-jwt-bearer');
    });

    test('Debe tener DTOs para validación', () => {
      const dtoPath = path.join(apiUserPath, 'src/users/dto/create-user.dto.ts');
      expect(fs.existsSync(dtoPath)).toBe(true);
    });
  });

  describe('API Customer - Responsabilidades', () => {
    const apiCustomerPath = path.join(__dirname, '../api-customer');
    
    test('Debe tener conexión directa a MongoDB', () => {
      const packagePath = path.join(apiCustomerPath, 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      expect(packageContent).toContain('mongoose');
    });

    test('Debe tener arquitectura por capas', () => {
      const schemaPath = path.join(apiCustomerPath, 'src/users/schemas/user.schema.ts');
      const servicePath = path.join(apiCustomerPath, 'src/users/users.service.ts');
      const controllerPath = path.join(apiCustomerPath, 'src/users/users.controller.ts');
      
      expect(fs.existsSync(schemaPath)).toBe(true);
      expect(fs.existsSync(servicePath)).toBe(true);
      expect(fs.existsSync(controllerPath)).toBe(true);
    });

    test('Debe validar SOLO tokens B2B', () => {
      const guardPath = path.join(apiCustomerPath, 'src/auth/auth.guard.ts');
      expect(fs.existsSync(guardPath)).toBe(true);
      const content = fs.readFileSync(guardPath, 'utf-8');
      expect(content).toContain('express-oauth2-jwt-bearer');
    });
  });

  describe('Infraestructura Docker', () => {
    const dockerComposePath = path.join(__dirname, '../infra/docker-compose.yml');
    
    test('Debe existir archivo docker-compose.yml', () => {
      expect(fs.existsSync(dockerComposePath)).toBe(true);
    });

    test('Debe tener MongoDB configurado', () => {
      const content = fs.readFileSync(dockerComposePath, 'utf-8');
      expect(content).toContain('mongodb:');
      expect(content).toContain('image: mongo:7');
    });

    test('Debe tener todos los servicios configurados', () => {
      const content = fs.readFileSync(dockerComposePath, 'utf-8');
      expect(content).toContain('api-user:');
      expect(content).toContain('api-customer:');
      expect(content).toContain('bff-shell:');
      expect(content).toContain('bff-child-1:');
      expect(content).toContain('portal-shell:');
      expect(content).toContain('portal-child-1:');
    });

    test('APIs deben depender de MongoDB', () => {
      const content = fs.readFileSync(dockerComposePath, 'utf-8');
      const apiUserSection = content.split('api-user:')[1].split('api-customer:')[0];
      const apiCustomerSection = content.split('api-customer:')[1].split('bff-')[0];
      
      expect(apiUserSection).toContain('depends_on:');
      expect(apiUserSection).toContain('- mongodb');
      expect(apiCustomerSection).toContain('depends_on:');
      expect(apiCustomerSection).toContain('- mongodb');
    });

    test('Cada servicio debe tener su Dockerfile', () => {
      const services = ['api-user', 'api-customer', 'shell/bff-shell', 
                       'portal-child/bff-child-1', 'shell/portal-shell', 
                       'portal-child/portal-child-1'];
      
      services.forEach(service => {
        const dockerfilePath = path.join(__dirname, '../', service, 'Dockerfile');
        expect(fs.existsSync(dockerfilePath)).toBe(true);
      });
    });
  });

  describe('Separación de Responsabilidades', () => {
    test('Frontends NO deben acceder a MongoDB', () => {
      const frontends = [
        path.join(__dirname, '../shell/portal-shell/package.json'),
        path.join(__dirname, '../portal-child/portal-child-1/package.json')
      ];
      
      frontends.forEach(pkgPath => {
        const content = fs.readFileSync(pkgPath, 'utf-8');
        expect(content).not.toContain('mongoose');
        expect(content).not.toContain('mongodb');
      });
    });

    test('BFFs NO deben acceder a MongoDB', () => {
      const bffs = [
        path.join(__dirname, '../shell/bff-shell/package.json'),
        path.join(__dirname, '../portal-child/bff-child-1/package.json')
      ];
      
      bffs.forEach(pkgPath => {
        const content = fs.readFileSync(pkgPath, 'utf-8');
        expect(content).not.toContain('mongoose');
        expect(content).not.toContain('mongodb');
      });
    });

    test('SOLO APIs deben acceder a MongoDB', () => {
      const apis = [
        path.join(__dirname, '../api-user/package.json'),
        path.join(__dirname, '../api-customer/package.json')
      ];
      
      apis.forEach(pkgPath => {
        const content = fs.readFileSync(pkgPath, 'utf-8');
        expect(content).toContain('mongoose');
      });
    });
  });
});

// Helper function
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}
