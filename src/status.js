import { createElement, Component } from 'preact' /** @jsx createElement */
import { debounce } from './debounce'

const statusDebounceMillis = 1400

export default class Status extends Component {
  static defaultProps = {
    autocompleteDebouncing: false,
    tQueryTooShort: (minQueryLength) => `Type in ${minQueryLength} or more characters for results`,
    tNoResults: () => 'No search results',
    tSelectedOption: (selectedOption, length, index) => `${selectedOption} ${index + 1} of ${length} is highlighted`,
    tResults: (length, contentSelectedOption) => {
      const words = {
        result: (length === 1) ? 'result' : 'results',
        is: (length === 1) ? 'is' : 'are'
      }

      return `${length} ${words.result} ${words.is} available. ${contentSelectedOption}`
    }
  };

  state = {
    bump: false,
    debounced: false
  }

  componentWillMount () {
    const that = this
    this.debounceStatusUpdate = debounce(function () {
      if (!that.state.debounced) {
        const shouldSilence = !that.props.isInFocus || that.props.validChoiceMade || that.props.autocompleteDebouncing
        that.setState(({ bump }) => ({ bump: !bump, debounced: true, silenced: shouldSilence }))
      }
    }, statusDebounceMillis)
  }

  componentWillReceiveProps ({ queryLength }) {
    this.setState({ debounced: false })
  }

  render () {
    const {
      id,
      length,
      queryLength,
      minQueryLength,
      selectedOption,
      selectedOptionIndex,
      tQueryTooShort,
      tNoResults,
      tSelectedOption,
      tResults
    } = this.props
    const { bump, debounced, silenced } = this.state

    const queryTooShort = queryLength < minQueryLength
    const noResults = length === 0

    const contentSelectedOption = selectedOption
      ? tSelectedOption(selectedOption, length, selectedOptionIndex)
      : ''

    let content = null
    if (queryTooShort) {
      content = tQueryTooShort(minQueryLength)
    } else if (noResults) {
      content = tNoResults()
    } else {
      content = tResults(length, contentSelectedOption)
    }

    this.debounceStatusUpdate()

    return (
      <div
        style={{
          border: '0',
          clip: 'rect(0 0 0 0)',
          height: '1px',
          marginBottom: '-1px',
          marginRight: '-1px',
          overflow: 'hidden',
          padding: '0',
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px'
        }}>
        <div
          id={id + '__status--A'}
          role='status'
          aria-atomic='true'
          aria-live='polite'>
          {(!silenced && debounced && bump) ? content : ''}
        </div>
        <div
          id={id + '__status--B'}
          role='status'
          aria-atomic='true'
          aria-live='polite'>
          {(!silenced && debounced && !bump) ? content : ''}
        </div>
      </div>
    )
  }
}
