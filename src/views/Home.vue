<template>

  <!-- Main page for new users to subscribe, app information -->
  <div id="home">

    <div class="jumbotron jumbotron-fluid bg-img">
      <div class="container">
        <div class="row">
          <div class="col title">
            <h1 class="display-6">Daily Chinese Vocab</h1>
            <p class="lead">Keep up on 中文 with daily HSK vocabulary in your inbox.</p>
            <!-- <h5>Keep up on 中文 with daily HSK vocabulary in your inbox.</h5> -->
          </div>
        </div>
      </div>
    </div>

    <div class="container bg-white sticky-top p-2">
      <div class="row justify-content-center">
        <ul class="nav" id="navbar">
          <li class="nav-item">
            <a class="nav-link active" href="#sub">Subscribe</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#sample">Sample Words</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#faq">FAQ</a>
          </li>
          <!-- <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'quiz'}">Practice</router-link>
          </li> -->
        </ul>
      </div>
    </div>

    <div data-spy="scroll" data-target="#navbar" data-offset="0">

      <div class="container bg-light p-1">
        <div class="anchor-target" id="sub"></div>
        <div class="row m-3">
          <div class="col-md-4 col-xs-6 p-3">
            <select class="custom-select" id="level">
              <option selected>Choose an HSK Level</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>
          <div class="col-md-8 col-xs-6 p-3">
            <div class="input-group">
              <input type="email" class="form-control" id="subscribe" value="" placeholder="Email address" aria-label="Email address" aria-describedby="button-addon2">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" id="button-addon2" onclick="return submitSub();">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row m-3">
          <div class="col text-center sub-response" id="sub-response">
            <!-- <p>Success! You're subscribed and will receive a confirmation email.</p> -->
          </div>
        </div>
      </div>

      <div class="container mt-4">
        <div class="anchor-target" id="sample"></div>
        <div class="row m-3">
          <div class="col-12">
            <h4>Which HSK level are you?</h4>
          </div>
          <div class="col-12">
            <p>Click on each level below to see sample words, or check out <router-link :to="{ name: 'history'}">recent daily words</router-link>.</p>
          </div>
        </div>
      </div>

      <div class="container mb-4">
        <div class="row m-3">
          <div class="col-3" id="v-pills-col">
            <div class="nav flex-column nav-pills text-center" id="v-pills-tab" role="tablist" aria-orientation="vertical">
              <a class="nav-link active" id="v-pills-one-tab" data-toggle="pill" href="#v-pills-one" role="tab" aria-controls="v-pills-one" aria-selected="true">
                <span class="d-none d-md-inline">Level </span>1
              </a>
              <a class="nav-link" id="v-pills-two-tab" data-toggle="pill" href="#v-pills-two" role="tab" aria-controls="v-pills-two" aria-selected="false">
                <span class="d-none d-md-inline">Level </span>2
              </a>
              <a class="nav-link" id="v-pills-three-tab" data-toggle="pill" href="#v-pills-three" role="tab" aria-controls="v-pills-three" aria-selected="false">
                <span class="d-none d-md-inline">Level </span>3
              </a>
              <a class="nav-link" id="v-pills-four-tab" data-toggle="pill" href="#v-pills-four" role="tab" aria-controls="v-pills-four" aria-selected="false">
                <span class="d-none d-md-inline">Level </span>4
              </a>
              <a class="nav-link" id="v-pills-five-tab" data-toggle="pill" href="#v-pills-five" role="tab" aria-controls="v-pills-five" aria-selected="false">
                <span class="d-none d-md-inline">Level </span>5
              </a>
              <a class="nav-link" id="v-pills-six-tab" data-toggle="pill" href="#v-pills-six" role="tab" aria-controls="v-pills-six" aria-selected="false">
                <span class="d-none d-md-inline">Level </span>6
              </a>
            </div>
          </div>
          <div class="col-9">
            <div class="tab-content" id="v-pills-tabContent">
              <div class="tab-pane fade show active 1" id="v-pills-one" role="tabpanel" aria-labelledby="v-pills-one-tab"></div>
              <div class="tab-pane fade 2" id="v-pills-two" role="tabpanel" aria-labelledby="v-pills-two-tab"></div>
              <div class="tab-pane fade 3" id="v-pills-three" role="tabpanel" aria-labelledby="v-pills-three-tab"></div>
              <div class="tab-pane fade 4" id="v-pills-four" role="tabpanel" aria-labelledby="v-pills-four-tab"></div>
              <div class="tab-pane fade 5" id="v-pills-five" role="tabpanel" aria-labelledby="v-pills-five-tab"></div>
              <div class="tab-pane fade 6" id="v-pills-six" role="tabpanel" aria-labelledby="v-pills-six-tab"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="container bg-light">
        <div class="anchor-target" id="faq"></div>
        <div class="row m-3 py-3">
          <div class="col-12 my-3">
            <h4>Frequently Asked Questions</h4>
          </div>
          <div class="col-12">
            <p class="bold">
              What am I subscribing to?
            </p>
            <p>
              Subscribers will receive an email message including a vocabulary word, pinyin (<a href="https://chinese.yabla.com/chinese-pinyin-chart.php">pronunciation</a>, <a href="https://chinese.yabla.com/chinese-tones-learn-the-right-way-with-tone-pairs.php">tones</a>), definition, and link to example sentences each day.
            </p>
            <p>
              Daily emails look like this:
            </p>
            <img src="https://s3.amazonaws.com/haohaotiantian.com/haohaotiantian-email-640.PNG">
            <p class="bold">
              How do I unsubscribe?
            </p>
            <p>
              Unsubscribe at any time by clicking the 'unsubscribe' link on the bottom of each email message.
            </p>
            <p class="bold">
              How should I use this to learn or practice Chinese?
            </p>
            <p>
              This service can help build your vocabulary, but won't cover grammar or other language fundamentals. Use this as a resource to supplement a Chinese course or HSK study plan.
            </p>
            <p class="bold">
              How do I pronounce the words?
            </p>
            <p>
              The link to example sentences for levels 1-3 takes you to <a href="https://www.yellowbridge.com/chinese/sentsearch.php?word=%E5%A4%A7%E5%AE%B6">YellowBridge Chinese-English dictionary</a>. Here you can find example sentences, character stroke order, and pronunciation audio. Clicking on the speech bubble plays the pronunciation.
            </p>
            <img src="https://hsk-vocab.s3.amazonaws.com/yellowbridge-pronunciation.PNG" style="max-width:300px;">
            <p>
              A good first step to learning Chinese is to learn pinyin (<a href="https://chinese.yabla.com/chinese-pinyin-chart.php">pronunciation</a>, <a href="https://chinese.yabla.com/chinese-tones-learn-the-right-way-with-tone-pairs.php">tones</a>), which is included for each daily email and will help you pronounce and <a href="https://blog.fluent-forever.com/learning-pronunciation/">remember</a> characters more easily.
            </p>
            <p class="bold">
              What is HSK vocabulary?
            </p>
            <p>
              HSK stands for 汉语水平考试 <a href="https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi">Hanyu Shuiping Kaoshi</a>, China's standardized Chinese language proficiency test. There are six levels of the HSK, with Level 1 testing for 150 basic words and Level 6 testing 5000 words. While just the vocabulary words alone are not enough to sufficiently prepare for the test, the vocabulary lists for each level provide a useful benchmark and learning tool to track a student's progress.
            </p>
            <p class="bold">
              What should I do with my daily vocab word?
            </p>
            <ul>
              <li>
                Write your own example sentences.
              </li>
              <li>
                Make a set of flash cards.
              </li>
              <li>
                Draw illustrations of each word.
              </li>
              <li>
                Get a tattoo of the word.
              </li>
              <li>
                Practice writing out the characters.
              </li>
              <li>
                Use the word in a journal entry.
              </li>
            </ul>
            <p class="bold">
              What does Haohaotiantian mean?
            </p>
            <p>
              好好学习，天天向上 - Study hard and make progress every day.
            </p>
            <p class="bold">
              I have a different question.
            </p>
            <p>
              Contact me here: <a href="https://twitter.com/messages/compose?recipient_id=2409492241" class="twitter-dm-button" data-screen-name="@em__shea">Message @em__shea</a>
            </p>
          </div>
        </div>
      </div>

    <custom-footer></custom-footer>

    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import exampleWords from '@/components/exampleWords.vue'
import wordHistory from '@/components/wordHistory.vue'
import customFooter from '@/components/footer.vue'

export default {
  name: 'home',
  components: {
    'example-words': exampleWords,
    'word-history': wordHistory,
    'custom-footer': customFooter
  },
  data () {
    return {
      exampleWordList: [],
      subEmail: null,
      subLevel: null
    }
  },
  mounted () {
    // On load, calls

    // Magic example:
    // this.pullSets().then(() => {
    //   this.setInitialParams()
    //   if (this.nameSelected) {
    //     this.searchByName(this.$route.query.name)
    //   } else {
    //     this.pullCards(this.params.set.id, this.params.color.id)
    //   }
    // })
  },
  methods: {
    getSampleWords () {
      return axios
        .get('https://api.haohaotiantian.com/sample_vocab', {}
        )
        .then((response) => {
          this.exampleWordList = response.data
        }
          // On load, calls my sample words API that returns example words for given level
          // Within HTML, pass sample words to exampleWords component to be rendered
        )
    },

    validateEmail () {

    },

    submitSubscription () {
      this.subURL = 'https://api.haohaotiantian.com/sub?email=' + this.subEmail
      return axios
        .post(this.subURL, {}
        )
    }
  }
}
</script>

<style lang="scss">

</style>
