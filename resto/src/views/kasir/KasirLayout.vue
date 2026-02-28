<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" color="primary">
        <ion-tab-button tab="transaksi" href="/kasir/transaksi">
          <ion-icon :icon="cartOutline" /><ion-label>Transaksi</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="meja" href="/kasir/meja">
          <ion-icon :icon="gridOutline" /><ion-label>Meja</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="riwayat" href="/kasir/riwayat">
          <ion-icon :icon="receiptOutline" /><ion-label>Riwayat</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage,IonTabs,IonRouterOutlet,IonTabBar,IonTabButton,IonIcon,IonLabel } from '@ionic/vue'
import { cartOutline, gridOutline, receiptOutline } from 'ionicons/icons'
</script>
