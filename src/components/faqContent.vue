<template>
  <div id="faq-content">
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
        <img src="https://s3.amazonaws.com/tsu-emshea.com-emshea-com-static/static/images/chinese-vocab-app/haohaotiantian-email-640.PNG">
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
        <p v-if="characterSet === 'simplified'">
        HSK stands for 汉语水平考试 <a href="https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi">Hanyu Shuiping Kaoshi</a>, China's standardized Chinese language proficiency test. There are six levels of the HSK, with Level 1 testing for 150 basic words and Level 6 testing 5000 words. While just the vocabulary words alone are not enough to sufficiently prepare for the test, the vocabulary lists for each level provide a useful benchmark and learning tool to track a student's progress.
        </p>
        <p v-if="characterSet === 'traditional'">
        HSK stands for 漢語水平考試 <a href="https://en.wikipedia.org/wiki/Hanyu_Shuiping_Kaoshi">Hanyu Shuiping Kaoshi</a>, China's standardized Chinese language proficiency test. There are six levels of the HSK, with Level 1 testing for 150 basic words and Level 6 testing 5000 words. While just the vocabulary words alone are not enough to sufficiently prepare for the test, the vocabulary lists for each level provide a useful benchmark and learning tool to track a student's progress.
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
        <p v-if="characterSet === 'simplified'">
        好好学习，天天向上 - Study hard and make progress every day.
        </p>
        <p v-if="characterSet === 'traditional'">
        好好學習，天天向上 - Study hard and make progress every day.
        </p>
        <p class="bold">
        I have a different question.
        </p>
        <p>
        <a href="https://twitter.com/messages/compose?recipient_id=2409492241">Please contact me.</a>
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
    }
  },
  computed: {
    characterSet () {
      return this.$root.$data.store.state.characterSet
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
