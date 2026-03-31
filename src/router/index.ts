import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/views/common/LandingPage.vue"),
  },
  {
    path: "/visitor-name",
    component: () => import("@/views/visitor/VisitorNamePage.vue"),
  },
  {
    path: "/visitor-menu",
    component: () => import("@/views/visitor/VisitorMenuPage.vue"),
  },
  {
    path: "/cart",
    component: () => import("@/views/visitor/CartPage.vue"),
  },
  {
    path: "/payment",
    component: () => import("@/views/visitor/PaymentPage.vue"),
  },
  {
    path: "/employee-login",
    component: () => import("@/views/employee/EmployeeLoginPage.vue"),
  },
  {
    path: "/employee-dashboard",
    component: () => import("@/views/employee/EmployeeDashboardPage.vue"),
  },
  {
    path: "/employee-reports",
    component: () => import("@/views/employee/EmployeeDailyReportPage.vue"),
  },
  {
    path: "/employee-stats",
    component: () => import("@/views/employee/EmployeeSalesStatisticPage.vue"),
  },
  {
    path: "/manajemen-menu",
    component: () => import("@/views/employee/ManajemenMenuPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
