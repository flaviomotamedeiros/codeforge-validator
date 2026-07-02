import os
import sys
import math

passed = 0
errors = []

def check(cond, msg):
    global passed
    if cond:
        passed += 1
    else:
        errors.append(msg)

def main():
    try:
        sys.path.insert(0, "repo")
        from calculator import (
            add, subtract, multiply, divide,
            power, sqrt, cbrt,
            sin, cos, tan, degrees_to_radians, radians_to_degrees,
            log, log10, log_base,
            mean, median, mode, std_dev,
        )
    except ImportError as e:
        errors.append("Nao foi possivel importar calculator.py: " + str(e))
        return

    # Operações básicas
    check(add(2, 3) == 5, "add(2, 3) deveria retornar 5")
    check(subtract(10, 4) == 6, "subtract(10, 4) deveria retornar 6")
    check(multiply(3, 4) == 12, "multiply(3, 4) deveria retornar 12")
    check(abs(divide(10, 4) - 2.5) < 1e-9, "divide(10, 4) deveria retornar 2.5")
    try:
        divide(1, 0)
        errors.append("divide por zero deveria lancar ValueError")
    except ValueError:
        passed += 1

    # Potência e raiz
    check(power(2, 8) == 256, "power(2, 8) deveria retornar 256")
    check(abs(sqrt(9) - 3.0) < 1e-9, "sqrt(9) deveria retornar 3.0")
    try:
        sqrt(-1)
        errors.append("sqrt(-1) deveria lancar ValueError")
    except ValueError:
        passed += 1
    check(abs(cbrt(27) - 3.0) < 1e-9, "cbrt(27) deveria retornar 3.0")

    # Trigonometria
    check(abs(sin(0)) < 1e-9, "sin(0) deveria ser 0")
    check(abs(cos(0) - 1.0) < 1e-9, "cos(0) deveria ser 1.0")
    check(abs(degrees_to_radians(180) - math.pi) < 1e-9, "degrees_to_radians(180) deveria ser pi")
    check(abs(radians_to_degrees(math.pi) - 180) < 1e-9, "radians_to_degrees(pi) deveria ser 180")

    # Logaritmos
    check(abs(log(math.e) - 1.0) < 1e-9, "log(e) deveria ser 1.0")
    check(abs(log10(100) - 2.0) < 1e-9, "log10(100) deveria ser 2.0")
    try:
        log(-1)
        errors.append("log(-1) deveria lancar ValueError")
    except ValueError:
        passed += 1

    # Estatística
    check(abs(mean([1, 2, 3, 4, 5]) - 3.0) < 1e-9, "mean([1,2,3,4,5]) deveria ser 3.0")
    check(median([1, 2, 3]) == 2, "median([1,2,3]) deveria ser 2")
    check(mode([1, 2, 2, 3]) == 2, "mode([1,2,2,3]) deveria ser 2")
    try:
        mean([])
        errors.append("mean([]) deveria lancar ValueError")
    except ValueError:
        passed += 1

if __name__ == "__main__":
    main()
    ok = len(errors) == 0
    output_parts = [str(passed) + " verificacoes OK"] if ok else errors[:6]
    output = "; ".join(output_parts).replace("\n", " ").replace('"', "'")[:400]
    result = f"passed={'true' if ok else 'false'}\noutput={output}\n"
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(result)
    print(result)
