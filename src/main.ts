import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { usePurchaseStore } from './stores/purchaseStore';
import './assets/main.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
usePurchaseStore().load();
app.use(router);
app.mount('#app');
