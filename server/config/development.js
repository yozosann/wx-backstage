
const localApi = 'http://127.0.0.1:9998';

module.exports = {
  apiConfig: {
    '/api': {
      url: localApi
    },
    '/.well-known/pki-validation/fileauth.txt': {
      url: localApi,
      map: function(path) {
				return path.replace(
					"/.well-known/pki-validation/fileauth.txt",
					"/fileauth.txt"
				);
			}
    }
  }
};
