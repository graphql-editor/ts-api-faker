import * as faker from 'faker';
import { FakerControllerInterface } from "./FakerControllerInterface";
import { isArray, isObject, objectFromEntries } from "@app/helpers/helpers";

//! Na konieć wrzucić wszytsko w Array --> Array.from(preparedData)
type outputDataType = Iterable<object> | ArrayLike<object>;

class FakerController implements FakerControllerInterface {

    private pass: number = 3;
    private request: string;
    private preparedData: object;

    public createResponse(parsedReq: string): string {
        this.request = parsedReq;
        const data: object = JSON.parse(this.request);

        // 1. wersja
        // this.preparedData = this.passWithCallback(data, this.generateStatic);

        // 2. wersja to Wszystkie jako promisy i then then then wg hierarhi
        // lub poprzez wszytskie dyrektywy

        console.log('---INPUT-------');
        console.log(data);
        this.preparedData = this.generateStatic(data);
        console.log('--------OUTPUT-------');
        console.log(this.preparedData);


        // 3. Sprawdzić czy obiekt wejściowy jest Obiektem czy Arrayem
        // Jak array to odrazu przetwarzac jak obiekt to zamienic na Array
        // if (isObject(data)) {
        //     console.log('hello');
        //     let tes = Array.from([data]);
        //     console.log(tes);
        // } else if (isArray(data)) {
        //     console.log('DUPA');
        //     console.log(Array.from([data]));
        // }


        // console.log(data);
        // console.log(Object.keys(data).includes('@settings'));
        // const tes = Object.entries(data)
        // console.log(tes);
        // const tes2 = objectFromEntries(tes);
        // console.log(tes2);
        // console.log(isArray(data));



        // console.log(this.preparedData);

        // for (let i = 1; i < this.pass; i++) {
        //     switch (key) {
        //         case value:
                    
        //             break;
            
        //         default:
        //             break;
        //     }
        // }


        return JSON.stringify([{"name": "Mike"}])
    }

    private passWithCallback(data: object, callback: CallableFunction): object  {
        let obj = data;
        const call = callback;

        // if (isObject(obj)) {
        //     Object.entries(obj).map(el => {
        //         call(el);

        //         for (const i in obj) {
        //             isObject(obj[i]) ?
        //             this.passWithCallback(obj[i], call): null;
        //         }
        //     });
        // }

        // if (isObject(obj) || isArray(obj)) {
        //     Object.entries(obj).map(el => {
        //         call(el);

        //         // if (is) {
                    
        //         // }
        //         // for (const i in obj) {
        //         //     isObject(obj[i]) ?
        //         //     this.passWithCallback(obj[i], call): null;
        //         // }
        //     });
        // }

        // if(isArray(obj)) {
        //     for (const i in obj) {
        //         isObject(obj[i]) ?
        //         this.passWithCallback(obj[i], call): null;
        //     }
        // }


        obj = call(obj);

        return obj;
    }

    /**
     * STATIC DIRECTIVE
     */
    private generateStatic(obj: object): object {

        const output = searchDirective(obj);
        function searchDirective(data: object): object {
            const obj = data;
            const out = objectFromEntries(Object.entries(obj).map(([key, val]) => {
                // console.log(obj);
                //! 1. Musi zacząc od środka na zewnątrz | Na szczycie
                if (isArray(val) || isObject(val)) {
                    searchDirective(val);
                }

                if(isArray(val)) {
                    if(val.includes('@repeat:2')) {
                        console.log('hello');
                    }
                }

                // Wszytskie Wartości jak na dłoni
                if(typeof val === 'string') {
                    console.log({'key':key, 'val':val});
                    // console.log(obj[key] === '@repeat:2');
                    // if (val === '@repeat:2' || key === '@repeat:2') {
                    //     console.log('KEY', key);
                    //     console.log('VAL', val);
                    //     delete obj[key];
                    // }
                }

                if(obj[key] === '@repeat:2' || key === '@repeat:2' || val === '@repeat:2') {
                    console.log(obj[key]);
                    console.log(val);
                    obj[key] = '';
                }
                // console.log(key === '@repeat:2');

                // delete obj[key];

                // if (val == '@repeat:2') {
                //     console.log(val);
                //     console.log(obj[key]);
                //     delete obj[key];
                // }

                

                return [key, val];
            }));
            // console.log(out);
            return out;
        };

        return output;
    }

    private fakeValue(data: object): object {
        /**
         * 1. Fakuje stringa i zwraca 
         * rozdziela dyrektywe od wartości do wygenerowania i łączy przed zwróceniem,
         * Dekoduje tylko Wrtości!!
         */
        return {};
    }

    private decodeLineByDirective(lineToParse: string): string {
        const line: string     = lineToParse;
        let parsedLine: string = '';

        return '';
    }
}
export default FakerController;

/**
 * @repeat - tylko dla tablic, tylko jako parametr
 */