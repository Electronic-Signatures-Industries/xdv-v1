import DriveComponent from './views/dashboard/pages/Drive.vue';
import DurableWebsite from './views/dashboard/pages/dapp/DurableWebsite.vue';
import index from './views/dashboard/Index.vue';
import MessagingComponent from './views/dashboard/pages/Messaging.vue';
import Router from 'vue-router';
import TemplateEditor from './views/dashboard/pages/TemplateEditor.vue';
import Vue from 'vue';
import WalletComponent from './views/dashboard/pages/Wallet.vue';
// @ts-ignore
// @ts-nocheck


Vue.use(Router);

export default new Router({
  mode: "hash",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      // @ts-ignore
      component: index,
      children: [
        {
          name: "Sitios Web Durables",
          path: "durable_website",
          // @ts-ignore
          component: DurableWebsite
        },
      ]
    },
    {
      path: "/xdv",
      // @ts-ignore
      component: index,

      children: [

        {
          path: "drive",
          name: "drive",
          // @ts-ignore
          component: DriveComponent
        },
        {
          path: "messaging",
          name: "messaging",
          // @ts-ignore
          component: MessagingComponent
        },
        {
          path: "wallet",
          name: "wallet",
          // @ts-ignore
          component: WalletComponent
        },
      ]
    },

    {
      path: "/fe",
      // @ts-ignore
      component: index,

      children: [


        {
          name: "Editor",
          path: "editor",
          // @ts-ignore
          component: TemplateEditor
        },
      ]
    }
  ]
});
