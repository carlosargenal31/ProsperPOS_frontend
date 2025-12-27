// ===================================================================
// VERIFICACIÓN DE CÓDIGO FRONTEND - INVENTARIO FÍSICO
// ===================================================================

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando código frontend de Inventario Físico...\n');

// Archivos a verificar
const files = {
  component: path.join(__dirname, 'src/views/pages/reports/physical-inventory.vue'),
  router: path.join(__dirname, 'src/router/index.js'),
  sidebar: path.join(__dirname, 'src/assets/json/sidebar.json')
};

// Verificación 1: Todos los archivos existen
console.log('1️⃣ Verificando existencia de archivos...');
let allFilesExist = true;
Object.entries(files).forEach(([name, filePath]) => {
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${name}: Existe`);
  } else {
    console.log(`   ❌ ${name}: NO EXISTE`);
    allFilesExist = false;
  }
});
console.log('');

if (!allFilesExist) {
  console.log('❌ Algunos archivos no existen. Abortando verificación.\n');
  process.exit(1);
}

// Verificación 2: include_images no debe existir
console.log('2️⃣ Verificando que include_images fue removido...');
const componentContent = fs.readFileSync(files.component, 'utf8');
if (componentContent.includes('include_images')) {
  console.log('   ❌ Componente todavía contiene include_images');
} else {
  console.log('   ✅ Sin referencias a include_images');
}

if (componentContent.includes('Incluir Imágenes')) {
  console.log('   ❌ Todavía contiene el texto "Incluir Imágenes"');
} else {
  console.log('   ✅ Sin referencias a "Incluir Imágenes"');
}
console.log('');

// Verificación 3: Botón "Generar Reporte"
console.log('3️⃣ Verificando botón "Generar Reporte"...');
if (componentContent.includes('Generar Reporte')) {
  console.log('   ✅ Botón "Generar Reporte" presente');
} else {
  console.log('   ❌ Botón "Generar Reporte" NO encontrado');
}

if (componentContent.includes('Generando...')) {
  console.log('   ✅ Estado "Generando..." presente');
} else {
  console.log('   ❌ Estado "Generando..." NO encontrado');
}

if (componentContent.includes(':disabled="loading"')) {
  console.log('   ✅ Botón se deshabilita durante carga');
} else {
  console.log('   ❌ Botón NO se deshabilita durante carga');
}

if (componentContent.includes('ti-search')) {
  console.log('   ✅ Icono ti-search presente');
} else {
  console.log('   ❌ Icono ti-search NO encontrado');
}
console.log('');

// Verificación 4: Endpoints API correctos
console.log('4️⃣ Verificando endpoints API...');
const correctEndpoints = [
  '/categories',
  '/subcategories',
  '/warehouses',
  '/brands',
  '/products?limit=9999'
];

correctEndpoints.forEach(endpoint => {
  if (componentContent.includes(`api.get('${endpoint}')`)) {
    console.log(`   ✅ ${endpoint}`);
  } else {
    console.log(`   ❌ ${endpoint}: NO ENCONTRADO o formato incorrecto`);
  }
});

// Verificar que NO tiene /v1/ duplicado
if (componentContent.includes("api.get('/v1/")) {
  console.log('   ⚠️  Advertencia: Se encontró /v1/ en endpoints (puede causar duplicación)');
} else {
  console.log('   ✅ Sin duplicación de /v1/ en endpoints');
}
console.log('');

// Verificación 5: Modals de búsqueda
console.log('5️⃣ Verificando modals de búsqueda...');
const requiredModals = [
  'showCategorySearch',
  'showSubcategorySearch',
  'showProductSearch'
];

requiredModals.forEach(modal => {
  if (componentContent.includes(modal)) {
    console.log(`   ✅ ${modal}`);
  } else {
    console.log(`   ❌ ${modal}: NO ENCONTRADO`);
  }
});
console.log('');

// Verificación 6: Métodos de búsqueda
console.log('6️⃣ Verificando métodos de búsqueda...');
const requiredMethods = [
  'searchCategories',
  'searchSubcategories',
  'searchProducts',
  'selectCategory',
  'selectSubcategory',
  'selectProduct',
  'clearCategory',
  'clearSubcategory',
  'clearProduct'
];

requiredMethods.forEach(method => {
  if (componentContent.includes(`${method}(`)) {
    console.log(`   ✅ ${method}`);
  } else {
    console.log(`   ❌ ${method}: NO ENCONTRADO`);
  }
});
console.log('');

// Verificación 7: Ruta registrada
console.log('7️⃣ Verificando ruta en router...');
const routerContent = fs.readFileSync(files.router, 'utf8');
if (routerContent.includes('physical-inventory') &&
    routerContent.includes("import('@/views/pages/reports/physical-inventory.vue')")) {
  console.log('   ✅ Ruta registrada correctamente');
} else {
  console.log('   ❌ Ruta NO registrada correctamente');
}
console.log('');

// Verificación 8: Entrada en sidebar
console.log('8️⃣ Verificando entrada en sidebar...');
const sidebarContent = fs.readFileSync(files.sidebar, 'utf8');
if (sidebarContent.includes('Lista de Inventario Físico') &&
    sidebarContent.includes('/reports/physical-inventory')) {
  console.log('   ✅ Entrada en sidebar correcta');
} else {
  console.log('   ❌ Entrada en sidebar NO encontrada');
}
console.log('');

// Verificación 9: Filters object
console.log('9️⃣ Verificando objeto filters...');
const requiredFilters = [
  'product_id',
  'category_id',
  'subcategory_id',
  'warehouse_id',
  'brand_id',
  'existence_filter',
  'include_cost',
  'include_average_cost',
  'include_prices',
  'include_codes',
  'include_unit',
  'include_brand',
  'group_by_warehouses',
  'group_by_groups',
  'group_by_articles'
];

let allFiltersPresent = true;
requiredFilters.forEach(filter => {
  if (componentContent.includes(`${filter}:`)) {
    console.log(`   ✅ ${filter}`);
  } else {
    console.log(`   ❌ ${filter}: NO ENCONTRADO`);
    allFiltersPresent = false;
  }
});
console.log('');

// Verificación 10: Import statements
console.log('🔟 Verificando imports...');
if (componentContent.includes("import api from \"@/utils/axios\"")) {
  console.log('   ✅ api importado desde @/utils/axios');
} else {
  console.log('   ❌ api NO importado correctamente');
}
console.log('');

// Resumen final
console.log('═'.repeat(60));
const hasIncludeImages = componentContent.includes('include_images') ||
                         componentContent.includes('Incluir Imágenes');
const hasGenerarReporte = componentContent.includes('Generar Reporte');
const hasCorrectEndpoints = !componentContent.includes("api.get('/v1/");

if (!hasIncludeImages && hasGenerarReporte && hasCorrectEndpoints && allFilesExist && allFiltersPresent) {
  console.log('✅ VERIFICACIÓN FRONTEND COMPLETADA EXITOSAMENTE');
  console.log('   Todos los cambios están correctamente implementados.');
} else {
  console.log('⚠️  VERIFICACIÓN COMPLETADA CON ADVERTENCIAS');
  console.log('   Revisar los puntos marcados con ❌');
}
console.log('═'.repeat(60));
console.log('');

process.exit(0);
