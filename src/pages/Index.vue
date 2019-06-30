<template>
  <q-page class="flex">
    <div v-if="loggedIn">
      <div class="q-pa-sm row q-gutter-sm q-mr-sm">
        <q-card class="my-card q-pa-sm bg-primary text-white col-md-4 col-xs-12" >
          <q-card-section>
            <div class="text-h4 text-center q-pb-sm">{{ balance.token }} USD</div>
            <div class="text-subtitle2 text-center">Вложено в проект</div>
            <q-card-section>
              {{ tokenShare }}% от общего капитала {{ tokenSupply }}
            </q-card-section>            
            <q-separator dark/>
            <q-card-actions vertical>
              <q-btn icon="get_app" flat label="Купить долю" @click="buyOMDialog = true" />
            </q-card-actions>            
          </q-card-section>
        </q-card>
        <q-card class="my-card q-pa-sm bg-accent text-white col-md-4 col-xs-12">
          <q-card-section>
            <div class="text-h4 text-center q-pb-sm">{{ balance.divsEosdt }} USD</div>
            <div class="text-subtitle2 text-center">Выплачено дивидендов</div>
            <q-card-section>
              {{ balance.currentProfits }} USD всего дивидендов<br/>
              {{ currentDivs }} USD к выплате
            </q-card-section>            
            <q-separator dark/>
          </q-card-section>
        </q-card>      
        <q-card class="my-card bg-secondary q-pa-sm text-white col-md-3 col-xs-12">
          <q-card-section>
            <div class="text-h4 text-center q-pb-sm">{{ balance.eosdt }} USD</div>
            <div class="text-subtitle2 text-center">На счету</div>
            <q-card-section>
              В наличии на счету в ликвидных активах
            </q-card-section>            
            <q-separator dark />
          </q-card-section>
        </q-card>      
      </div>

      <q-dialog v-model="buyOMDialog" persistent>
        <q-card style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">Вложить в Project X</div>
            <div class="text-h7">Всего на продажу: {{ balance.tokensOnSale }} USD. </div>
            <div class="text-h7">В наличии: {{ balance.eosdt }} USD</div>
            <div class="row q-pa-md q-gutter-sm">
              <q-btn color="primary" size="xs" label="На все 100%" @click="buy100"/>
              <q-btn color="primary" size="xs" label="50%" @click="buy50"/>
              <q-btn color="primary" size="xs" label="25%" @click="buy25"/>
              <q-btn color="primary" size="xs" label="10%" @click="buy10"/>
              <q-btn color="primary" size="xs" label="Минимум" @click="buyMin"/>
            </div>
          </q-card-section>

          <q-card-section>
            <q-input dense v-model="buyTokenInput" autofocus @keyup.enter="prompt = false" />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Отменить" v-close-popup />
            <q-btn flat label="Купить Долю" v-close-popup @click="purchaseToken"/>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div class="q-pa-lg">
        <q-timeline layout="dense" side="right" color="secondary">
          <q-timeline-entry heading>Дорожная карта Проекта Х</q-timeline-entry>
          <q-timeline-entry title="Запуск проекта" subtitle="1 Августа, 2019 г." side="left" >
            <div>
              Официальный запуск
            </div>
          </q-timeline-entry>

          <q-timeline-entry title="Краудфандинг" subtitle="июнь - июль 2019 г." side="right">
            <div>
              Привлечение инвесторов. Реализация долей в компании
            </div>
          </q-timeline-entry>

          <q-timeline-entry title="Система управления фондом" subtitle="июнь 2019 г." side="left">
            <div>
              Разработка и запуск автоматизированной системы учета и распределения прибыли между инвесторами. Запуск токена ХХХUSD.
            </div>
          </q-timeline-entry>

          <q-timeline-entry title="Рождение проекта" subtitle="январь-май 2019 г." side="right" icon="done_all">
            <div>
              Рождение идеи, формирование команды.
            </div>
          </q-timeline-entry>
        </q-timeline>

        <div>
          <h5>Получены дивиденды:</h5>
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left">Дата</th>
                <th class="text-right">Кол-во токенов</th>
                <th class="text-right">Примечание</th>
              </tr>
            </thead>
            <tbody>
            <tr v-for="(action, index) in dividendsActions" :key="index">
              <td class="text-left">{{ (action.time).toDateString() }}</td>
              <td class="text-right">{{action.quantity}}</td>
              <td class="text-right">{{action.memo}}</td>
            </tr>
            </tbody>
          </q-markup-table>
        </div>

        <div>
          <h5>Выпуск токенов:</h5>
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left">Дата</th>
                <th class="text-right">Кол-во токенов</th>
                <th class="text-right">Примечание</th>
              </tr>
            </thead>
            <tbody>
            <tr v-for="(action, index) in issueActions" :key="index">
              <td class="text-left">{{ (action.time).toDateString() }}</td>
              <td class="text-right">{{action.quantity}}</td>
              <td class="text-right">{{action.memo}}</td>
            </tr>
            </tbody>
          </q-markup-table>

        </div>
      </div>      

    </div>
    <div v-else>
      <div class="q-pa-md">
        <p class="text-h6">Добро пожаловать в Проект Х</p>
        <p class="text-h6">
          Для участия в деятельности компании в качестве инвестора, Вам необходимо <a href="/signup">зарегистрироваться</a>, 
          либо авторизоваться с помощью Scatter кошелька.        
        </p>
        <p>
          <q-btn @click="login">Войти через Scatter</q-btn>
        </p>
        <q-card class="my-card col-xs-12 q-pa-sm q-ma-sm">
          <q-img class="col-11" src="/assets/happy.jpg" />
        </q-card>      
      </div>
    </div>
  </q-page>
</template>

<script>
  import {mapActions, mapGetters} from 'vuex'

  export default {
    data() {
      return {
        buyOMDialog: false,
        buyTokenInput: 10,
        comingSoon: false       
      }
    },
    methods: {
      ...mapActions('eosaccount', ['login', 'logout', 'transferToPresale']),
      buy100() {
        this.buyTokenInput = this.balance.eosdt
      },
      buy50() {
        this.buyTokenInput = this.balance.eosdt * 0.5
      },
      buy25() {
        this.buyTokenInput = this.balance.eosdt * 0.25
      },
      buy10() {
        this.buyTokenInput = this.balance.eosdt * 0.1
      },
      buyMin() {
        this.buyTokenInput = 10
      },
      purchaseToken() {
        console.log("purchaseToken: ", this.buyTokenInput)
        this.transferToPresale(this.buyTokenInput)
      }
    },
    computed: {
      ...mapGetters('eosaccount', ['loggedIn', 'account', 'balance', 'issueActions', 'tokenSupply', 'dividendsActions']),
      tokenShare() {
        return (this.balance.token / this.tokenSupply * 100).toFixed(2)
      },
      currentDivs() {
        return (this.balance.currentProfits * this.tokenShare / 100).toFixed(2)
      }
    }
  }
</script>

<style>
</style>