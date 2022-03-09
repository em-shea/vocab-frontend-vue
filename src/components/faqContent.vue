<template>
  <div id="faq-content">
    <div class="container bg-light pb-5">
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
        Select your Chinese level and subscribe to receive daily emails with vocabulary words at this level, along with links to <router-link :to="{ name: 'quiz'}">practice quizzes</router-link> and example sentences.
        </p>
        <p>
        Daily emails look like this:
        </p>
        <img src="https://hhtt-static.s3.amazonaws.com/email-screenshot-wide.png">
        <p class="bold">
        How do I unsubscribe?
        </p>
        <p>
        You can <router-link :to="{ name: 'unsub'}">unsubscribe here</router-link>, or <router-link :to="{ name: 'sign-in'}">login to your account</router-link> to manage which lists you are subscribed to.
        </p>
        <p class="bold">
        How do I pronounce the words?
        </p>
        <p>
        Click on the <span class="oi oi-volume-high audio-icon example-icon"></span> icon to hear the pronunciation.
        </p>
        <p class="bold">
        What is HSK vocabulary?
        </p>
        <p v-if="characterSet === 'simplified'">
        HSK stands for 汉语水平考试 <a href="https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi">Hanyu Shuiping Kaoshi</a>, China's standardized Mandarin Chinese language proficiency test for non-native speakers. There are six levels of the HSK, from Level 1 with 150 basic words to Level 6 with 5,000 words.
        </p>
        <p v-if="characterSet === 'traditional'">
        HSK stands for 漢語水平考試 <a href="https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi">Hanyu Shuiping Kaoshi</a>, China's standardized Mandarin Chinese language proficiency test for non-native speakers. There are six levels of the HSK, from Level 1 with 150 basic words to Level 6 with 5,000 words.
        </p>
        <p class="bold">
        What should I do with my daily vocab word?
        </p>
        <ul>
          <li>
              <router-link :to="{ name: 'quiz'}">Take a practice quiz.</router-link>
          </li>
          <li>
              Write your own example sentences.
          </li>
          <li>
              Make a set of flash cards for <router-link :to="{ name: 'review'}">recent vocab words</router-link>.
          </li>
          <li>
              Draw illustrations of each word.
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
        <p v-if="characterSet === 'simplified'">
        好好学习，天天向上 <span @click="playAudio(audio_file)" class="oi oi-volume-high audio-icon"></span>
        <audio id="audio" :src="audio_file">"Sorry, your browser does not support audio files."</audio>
        </p>
        <p v-if="characterSet === 'traditional'">
        好好學習，天天向上 <span @click="playAudio(audio_file)" class="oi oi-volume-high audio-icon"></span>
        <audio id="audio" :src="audio_file">"Sorry, your browser does not support audio files."</audio>
        </p>
        <p>Study hard and make progress every day.</p>
        <p class="bold">
          How is Haohaotiantian built?
        </p>
        <p>
          If you're interested in the technology that this web application is built on, you can check out <a href="https://www.youtube.com/watch?v=amLjm87Fy6s">this talk</a> and <a href="https://emshea.com/post/chinese-vocab-app">these </a><a href="https://emshea.com/post/vocab-app-database">blog </a><a href="https://emshea.com/post/vocab-subscriber-backend">posts</a>.
        </p>
        <p class="bold">
        I have a different question.
        </p>
        <p>
        Please get in touch over <a href="https://twitter.com/messages/2409492241-1315062296033411072">Twitter</a> or email us at <a href="mailto:hello@haohaotiantian.com">hello@haohaotiantian.com</a>.
        </p>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'faqContent',
  data () {
    return {
      audio_file: 'https://vocab-static.s3.amazonaws.com/audio/.466f61ff-1959-4718-b861-103c869b07d5.mp3'
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  methods: {
    playAudio (audioFile) {
      let audio = new Audio(audioFile)
      audio.play()
    }
  }
}
</script>

<style scoped>
  .example-icon:hover {
    color: #fe4c00;
    cursor: auto;
  }
</style>
