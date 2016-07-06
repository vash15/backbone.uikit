Base View
=============

È la view base da cui ereditare tutte le view dell'applicazione. Molto importante è il metodo `destroy` che aiuta a distruggere l'elemento dal DOM e rimuovere gli eventi appesi ad essa. Inoltre, gestisce il destroy automatico di tutte le sue view figlie.

## API

### Property

#### touchActiveClassName
È il nome della classe CSS da applicare quando l'elemto è "attivo". Default: `active-state`



### Methods

#### initialize([options])

Options:
- `removeOnDestroy` Default: `true`


#### addClass()
Può essere una stringa o una funzione e serve per comporre il nome CSS della classe.

### setState(state)
Imposta lo state attuale alla view.

### getState()
Ritorna lo state.

### addEvents(events)


### addSubView(name, view, state)


### getSubView(name)



#### destroy()
Rimuove la view dal DOM, spegne gli eventi ad essa associata e richiama l'evento `onDestroy`.

#### setZindex(zIndex)
Imposta uno z-index alla view. `zIndex` deve essere un intero positivo.

#### getZindex()
Ritorno lo z-index della view.

#### addEvents(events)
Metodo di comodo per aggiungere eventi alla view base. È preferibile usarlo al posto della property `events`.

### Events

#### onDestroy
Viene richiamato al destroy della view. Se la view possiede delle view figlie, questo metodo richiama tutti i destroy


## Usage

```javascript

import { BaseView } from 'backbone.uikit';

export default class MyView extends BaseView {

	addClass(){
		return 'my-view';
	}

	constructor(options){
		super(options);

		// Adding a sub view width state
		this.addSubView('labelView', new LabelView({ message: '42!' }), this.getState() );

	}

	onRender(rendered){
		if ( rendered )
			return this;

		let labelView = this.getSubView('labelView');
		this.$el.empty().append( labelView.el );
		labelView.render();

		return this;
	}

	onDestroy(options){
		console.log('on destroy My View!');
		super.onDestroy(options);
	}

}

```
