import { Loading } from 'element-ui'

export const LoadingUtil = {
  loading: '',
  showLoading: function() {
    this.loading = Loading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0)'
    })
  },
  hideLoading: function() {
    if (this.loading) {
      this.loading.close()
    }
  }
}

