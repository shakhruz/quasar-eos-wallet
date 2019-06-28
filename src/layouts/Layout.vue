<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn flat to="/">QUASAR EOS WALLET</q-btn>
        </q-toolbar-title>
        <div v-if="loggedIn" class="row">
          <div class="col">
            <q-btn flat :label="account.name" @click="logout" />
            <q-btn flat round icon="exit_to_app" @click="logout" />
          </div>
        </div>
        <div v-else>
          <q-btn flat label="Войти" @click="login" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

export default {
  name: 'Layout',
  methods: {
    ...mapActions('eosaccount', ['login', 'logout']),
  },
  computed: {
    ...mapGetters('eosaccount', ['loggedIn', 'account', 'balance'])
  },  
}
</script>

<style lang="scss"></style>
