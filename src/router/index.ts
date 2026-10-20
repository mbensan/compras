import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PurchaseFormView from '../views/PurchaseFormView.vue';
import PurchaseReviewView from '../views/PurchaseReviewView.vue';
import { usePurchaseStore } from '../stores/purchaseStore';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/purchases/new',
      name: 'purchase-new',
      component: PurchaseFormView,
      // Crea la solicitud en memoria y redirige a su edición.
      beforeEnter: () => {
        const r = usePurchaseStore().createRequest();
        return { name: 'purchase-edit', params: { id: r.id }, replace: true };
      },
    },
    { path: '/purchases/:id/edit', name: 'purchase-edit', component: PurchaseFormView, props: true },
    { path: '/purchases/:id/review', name: 'purchase-review', component: PurchaseReviewView, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
  document.title = `${(to.meta.title as string) ?? 'Asistente de Compras Públicas'}`;
});

export default router;
