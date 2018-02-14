'use babel';
import { CompositeDisposable } from 'atom'

export default {
  subscription: null,
  socket: null,
  id: null,
  activate(state) {
    if(!atom.config.get('id')) {
      atom.config.set('id', Math.floor(Math.random() * 1000000) + 1);
    }
    this.id = atom.config.get('id');
    this.socket = new WebSocket("ws://sunho.kim/shower/listen");
    this.register();
    atom.workspace.onDidChangeActiveTextEditor(() => {
      if(this.subscription) {
        this.subscription.dispose();
      }
      this.register();
    })
    atom.notifications.addSuccess("Shower ACTIVATED")
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'code-shower:source': () => this.source()
    }))
  },
  source() {
    atom.clipboard.write('https://github.com/ksunhokim123/code-shower')
    atom.notifications.addSuccess("The link is copied. You can paste it to the web browser's address bar.")
  },
  register() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      this.subscription=editor.onDidStopChanging(()=> {this.handle(editor)});
    }
  },
  handle(editor) {
    if(this.socket.readyState === 1) {
      this.socket.send(this.id+"\n"+editor.getTitle()+"\n"+editor.getText());
    }
  },
  deactivate() {
    this.subscription.dispose();
    this.socket.close();
  }
};
