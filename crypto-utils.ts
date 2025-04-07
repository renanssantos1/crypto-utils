export class CryptoUtil {
	static decrypt(value: string): Observable<string> {
    return of(atob(value)); 
  }

	static encrypt(value: string): Observable<string> {
    return of(btoa(value));
  }

	static encryptObject<T>(obj: T): Observable<T> {
		if (!obj) return of(obj);

		const fieldsToEncrypt = getCryptoFields(obj);
		const tasks$ = fieldsToEncrypt.map(field => {
			const value = (obj as any)[field];
			return this.encrypt(value).pipe(map(encryptedValue => ({ field, encryptedValue })));
		});

		const recursiveTasks$: Observable<any>[] = [];

		for (const key of Object.keys(obj)) {
			const value = (obj as any)[key];

			// Caso seja array de objetos (ex: admins)
			if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
				recursiveTasks$.push(
					this.encryptArray(value).pipe(map(v => ({ key, value: v })))
				);
			}

			// Caso seja objeto direto
			else if (typeof value === 'object' && value !== null) {
				recursiveTasks$.push(
					this.encryptObject(value).pipe(map(v => ({ key, value: v })))
				);
			}
		}

		return forkJoin([...tasks$, ...recursiveTasks$]).pipe(
			map(results => {
				const newObj = { ...obj } as any;
				results.forEach((result: any) => {
					newObj[result.field || result.key] = result.encryptedValue || result.value;
				});
				return newObj as T;
			})
		);
	}

	static decryptObject<T>(obj: T): Observable<T> {
		if (!obj) return of(obj);

		const fieldsToDecrypt = getCryptoFields(obj);
		const tasks$ = fieldsToDecrypt.map(field => {
			const value = (obj as any)[field];
			return this.decrypt(value).pipe(map(decryptedValue => ({ field, decryptedValue })));
		});

		const recursiveTasks$: Observable<any>[] = [];

		for (const key of Object.keys(obj)) {
			const value = (obj as any)[key];

			// Caso seja array de objetos (ex: admins)
			if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
				recursiveTasks$.push(
					this.decryptArray(value).pipe(map(v => ({ key, value: v })))
				);
			}

			// Caso seja objeto direto
			else if (typeof value === 'object' && value !== null) {
				recursiveTasks$.push(
					this.decryptObject(value).pipe(map(v => ({ key, value: v })))
				);
			}
		}

		return forkJoin([...tasks$, ...recursiveTasks$]).pipe(
			map(results => {
				const newObj = { ...obj } as any;
				results.forEach((result: any) => {
					newObj[result.field || result.key] = result.decryptedValue || result.value;
				});
				return newObj as T;
			})
		);
	}

	static encryptArray<T>(arr: T[]): Observable<T[]> {
		return forkJoin(arr.map(obj => this.encryptObject(obj)));
	}

	static decryptArray<T>(arr: T[]): Observable<T[]> {
		return forkJoin(arr.map(obj => this.decryptObject(obj)));
	}

}