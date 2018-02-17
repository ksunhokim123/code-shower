'use babel';
import { CompositeDisposable } from 'atom'

export default {
  subscription: null,
  socket: null,
  id: null,
  activate(state) {
    if(!atom.config.get('shower_id')) {
      atom.config.set('shower_id', Math.floor(Math.random() * 1000000) + 1);
    }
    if(!atom.config.get('shower_server')) {
      atom.config.set('shower_server', 'wss://sunho.kim/shower');
    }
    this.id = atom.config.get('shower_id');
    this.socket = new WebSocket(atom.config.get('shower_server')+"/listen");
    this.register();
    atom.workspace.onDidChangeActiveTextEditor(() => {
      if(this.subscription) {
        this.subscription.dispose();
      }
      this.register();
    })
    setInterval(() => {
      let editor;
      if (editor = atom.workspace.getActiveTextEditor()) {
        this.handle(editor);
      }
    }, 1000);
    atom.notifications.addSuccess("Shower ACTIVATED")
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'code-shower:id': () => {
        atom.notifications.addSuccess("id" + this.id);
      },
      'code-shower:reload': () => {
        this.socket.close();
        this.socket = new WebSocket(atom.config.get('shower_server')+"/listen");
        atom.notifications.addSuccess("reload");
      },
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
