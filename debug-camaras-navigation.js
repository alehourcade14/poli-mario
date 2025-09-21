const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE NAVEGACIÓN A CÁMARAS');
console.log('=====================================');
console.log('');

// Verificar archivos necesarios
const filesToCheck = [
  'app/dashboard/camaras/page.tsx',
  'components/dashboard-layout.tsx',
  'components/camaras-map.tsx',
  'middleware.ts'
];

console.log('1. Verificando archivos necesarios...');
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - NO EXISTE`);
  }
});

console.log('');

// Verificar contenido de dashboard-layout.tsx
console.log('2. Verificando dashboard-layout.tsx...');
if (fs.existsSync('components/dashboard-layout.tsx')) {
  const content = fs.readFileSync('components/dashboard-layout.tsx', 'utf8');
  
  // Verificar si tiene la ruta de cámaras
  if (content.includes('"/dashboard/camaras"')) {
    console.log('✅ Ruta /dashboard/camaras encontrada');
  } else {
    console.log('❌ Ruta /dashboard/camaras NO encontrada');
  }
  
  // Verificar si usa user?.rol
  if (content.includes('user?.rol')) {
    console.log('✅ user?.rol encontrado (correcto)');
  } else if (content.includes('user?.role')) {
    console.log('❌ user?.role encontrado (incorrecto)');
  } else {
    console.log('⚠️  No se encontró verificación de rol');
  }
  
  // Verificar si tiene el icono Camera
  if (content.includes('Camera')) {
    console.log('✅ Icono Camera encontrado');
  } else {
    console.log('❌ Icono Camera NO encontrado');
  }
} else {
  console.log('❌ dashboard-layout.tsx no existe');
}

console.log('');

// Verificar contenido de la página de cámaras
console.log('3. Verificando página de cámaras...');
if (fs.existsSync('app/dashboard/camaras/page.tsx')) {
  const content = fs.readFileSync('app/dashboard/camaras/page.tsx', 'utf8');
  
  if (content.includes('CamarasMap')) {
    console.log('✅ Componente CamarasMap importado');
  } else {
    console.log('❌ Componente CamarasMap NO importado');
  }
  
  if (content.includes('DashboardLayout')) {
    console.log('✅ DashboardLayout importado');
  } else {
    console.log('❌ DashboardLayout NO importado');
  }
} else {
  console.log('❌ Página de cámaras no existe');
}

console.log('');

// Verificar package.json
console.log('4. Verificando configuración del proyecto...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Proyecto: ${packageJson.name || 'No definido'}`);
  console.log(`✅ Next.js: ${packageJson.dependencies?.next || 'No encontrado'}`);
} else {
  console.log('❌ package.json no existe');
}

console.log('');

// Verificar .env.local
console.log('5. Verificando variables de entorno...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (envContent.includes('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')) {
    console.log('✅ Google Maps API Key configurada');
  } else {
    console.log('⚠️  Google Maps API Key no configurada');
  }
} else {
  console.log('⚠️  .env.local no existe');
}

console.log('');
console.log('=====================================');
console.log('DIAGNÓSTICO COMPLETADO');
console.log('=====================================');
console.log('');
console.log('Si hay errores, ejecuta:');
console.log('1. fix-camaras-simple.bat');
console.log('2. npm run dev');
console.log('3. Ve a /dashboard y prueba el botón Cámaras');
console.log('');
